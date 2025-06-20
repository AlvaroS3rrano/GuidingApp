import { BleManager, ScanMode } from "react-native-ble-plx";
import base64 from "react-native-base64";
import { calculateDistance } from "@/resources/distance";
import requestPermissions from "@/app/hooks/permissions";
import { EventEmitter } from "events";
import { NodeService } from "./nodeService";
import axios from "axios";


/**
 * BeaconScannerService - Handles BLE beacon scanning.
 *
 * This service utilizes react-native-ble-plx to perform continuous beacon scanning in the background.
 * It maintains a global list of detected beacons, updating each device's information based on scan data.
 * An EventEmitter broadcasts real-time updates so that other components (like the Beacon List Screen)
 * can subscribe and render the latest beacon information.
 * The service also determines the closest beacon based on estimated distance and stores its identifier in AsyncStorage.
 * In case of a scanning error, the service will attempt to restart scanning every 5 seconds.
 */
export const beaconEventEmitter = new EventEmitter();

// Interface for scanned devices
export interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  identifier: string | null;
  distance: number | null;
  lastSeen: number;
  mapID: number | -1;
}

const TARGET_SERVICE_UUID = "0000fe9a-0000-1000-8000-00805f9b34fb";
const bleManager = new BleManager();
let devices: ScannedDevice[] = [];
const knownMap   = new Map<string, ScannedDevice>();
const unknownMap = new Map<string, ScannedDevice>();

export const startBeaconScanning = async () => {
  // Request necessary Bluetooth permissions
  const permissionsGranted = await requestPermissions();
  if (!permissionsGranted) {
    console.warn("Bluetooth permissions not granted.");
    beaconEventEmitter.emit("error", "Bluetooth permissions not granted.");
    return;
  }

  // Start scanning for beacons
  bleManager.startDeviceScan(
    [TARGET_SERVICE_UUID],
    {
      allowDuplicates: true,
      scanMode: ScanMode.Balanced,
      legacyScan: true,
    },
    async (error, scannedDevice) => {
      if (error) {
        console.warn("Scan error:", error);
        beaconEventEmitter.emit("error", error.message || "Scan error occurred.");
        // Stop the current scan and retry after 5 seconds
        bleManager.stopDeviceScan();
        setTimeout(() => {
          startBeaconScanning();
        }, 5000);
        return;
      }
      
      if (scannedDevice) {
        let identifier = null;
        if (scannedDevice.serviceData) {
          const serviceData = scannedDevice.serviceData[TARGET_SERVICE_UUID];
          if (serviceData) {
            const decodedData = base64.decode(serviceData);
            // Check if the first byte indicates valid data
            if (decodedData.charCodeAt(0) === 0x00) {
              identifier = decodedData
                .slice(1, 17)
                .split("")
                .map((char) =>
                  ("0" + char.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("");
            }
          }
        }

        // Calculate the estimated distance using the RSSI value
        const distance = scannedDevice.rssi
          ? calculateDistance(scannedDevice.rssi)
          : null;

        // Create a new device object with the current timestamp
        const newDevice: ScannedDevice = {
          id: scannedDevice.id,
          name: scannedDevice.name,
          rssi: scannedDevice.rssi,
          identifier,
          distance,
          lastSeen: Date.now(),
          mapID: -1,
        };

        if (newDevice.identifier) {
          const id = newDevice.identifier;
          // 1) Si ya está en knownMap
          if (knownMap.has(id)) {
            const existing = knownMap.get(id)!;
            // conserva el mapID si ya venía asignado
            if (existing.mapID !== -1) {
              newDevice.mapID = existing.mapID;
            }
            knownMap.set(id, newDevice);
        
          // 2) Si ya está en unknownMap
          } else if (unknownMap.has(id)) {
            unknownMap.set(id, newDevice);
        
          // 3) Si no lo conoces todavía, lo reservas enseguida
          } else {
            unknownMap.set(id, newDevice);
        
            try {
              const node = await NodeService.getNodeByBeaconId(id);
              if (node) {
                // pásalo a knownMap
                const dev = unknownMap.get(id)!;
                unknownMap.delete(id);
                knownMap.set(id, dev);
              }
              // si no existe node, se queda en unknownMap
            } catch (err: unknown) {
              if (axios.isAxiosError(err) && err.response?.status === 404) {
                console.log(`Beacon ${id} no encontrado.`);
              } else {
                console.error(`Error al procesar el beacon ${id}:`, err);
              }
            }
          }
        }
        
        // Update the devices list: remove any previous instance of the same device
        devices = devices.filter(device => device.id !== scannedDevice.id);
        devices.push(newDevice);

        // Remove devices not seen in the last 5 seconds
        devices = devices.filter(device => Date.now() - device.lastSeen < 5000)
        
        const matchedKnownDevices = Array.from(knownMap.values()).filter((device) =>
          devices.some((known) => known.identifier === device.identifier)
        );

        // beaconEventEmitter.emit("update", matchedKnownDevices);

        const closest = matchedKnownDevices.reduce<ScannedDevice | undefined>(
          (closest, device) => {
            if (device.distance === null) return closest;
            if (!closest || (closest.distance !== null && device.distance < closest.distance)) {
              return device;
            }
            return closest;
          },
          undefined
        );
        // Obtienes el dispositivo más cercano a partir del Map
        const closestDevice = closest?.identifier
              ? knownMap.get(closest.identifier)
              : undefined;

        //console.log(closestDevice)
        if (closestDevice) {
          beaconEventEmitter.emit('closestBeacon', closestDevice.identifier);
        }
      }
    }
  );
};

export const stopBeaconScanning = () => {
  bleManager.stopDeviceScan();
};
