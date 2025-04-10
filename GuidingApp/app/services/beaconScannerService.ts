// BeaconScannerService.ts
import { BleManager, ScanMode } from "react-native-ble-plx";
import base64 from "react-native-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateDistance } from "@/resources/distance";
import requestPermissions from "@/resources/permissions";
import { EventEmitter } from "events";
import { NodeService } from "./nodeService";
import { MapService } from "./mapService";

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
}

const TARGET_SERVICE_UUID = "0000fe9a-0000-1000-8000-00805f9b34fb";
const bleManager = new BleManager();
let devices: ScannedDevice[] = [];
let knownBeacons: ScannedDevice[] = [];
let unknownBeacons: ScannedDevice[] = [];
let previousMapDataId: number | null = null;

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
      scanMode: ScanMode.LowLatency,
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
        };

        
        if (newDevice.identifier != null) {
          const knownIndex = knownBeacons.findIndex(b => b.identifier === newDevice.identifier);
          const unknownIndex = unknownBeacons.findIndex(b => b.identifier === newDevice.identifier);
          

          if (knownIndex >= 0) {
            knownBeacons[knownIndex] = { ...knownBeacons[knownIndex], ...newDevice };
            console.log(`Beacon ${newDevice.identifier} actualizado en knownBeacons.`);
          } else if (unknownIndex >= 0) {
            unknownBeacons[unknownIndex] = { ...unknownBeacons[unknownIndex], ...newDevice };
            console.log(`Beacon ${newDevice.identifier} actualizado en unknownBeacons.`);
          } else {
            try {
              const node = await NodeService.getNodeByBeaconId(newDevice.identifier);

              if (node) {
                knownBeacons.push(newDevice);
              } else {
                unknownBeacons.push(newDevice);
              }
            } catch (error) {
              console.log(`Error al procesar el beacon ${newDevice.identifier}`);
            }
          }
        }
        
        // Update the devices list: remove any previous instance of the same device
        devices = devices.filter(device => device.id !== scannedDevice.id);
        devices.push(newDevice);

        // Remove devices not seen in the last 5 seconds
        devices = devices.filter(device => Date.now() - device.lastSeen < 5000)
        
        const matchedKnownDevices = devices.filter((device) =>
          knownBeacons.some((known) => known.identifier === device.identifier)
        );

        // Emit the updated devices list to listeners
        beaconEventEmitter.emit("update", matchedKnownDevices);

        // Optionally, determine and store the closest beacon in AsyncStorage
        const closest = knownBeacons.reduce<ScannedDevice | undefined>(
          (closest, device) => {
            if (device.distance === null) return closest;
            if (!closest || (closest.distance !== null && device.distance < closest.distance)) {
              return device;
            }
            return closest;
          },
          undefined
        );
        if (closest && closest.identifier) {
          try {
            const mapData = await MapService.getMapDataByNodeId(closest.identifier);
            if (mapData) {
              // Si el mapData actual es diferente del previo, entonces se emite el evento
              if (previousMapDataId !== mapData.id) {
                previousMapDataId = mapData.id;
                //await AsyncStorage.setItem("closestBeacon", closest.identifier);
                beaconEventEmitter.emit("closestMapData", mapData);
              } else {
                beaconEventEmitter.emit("newMapData", false)
              }
            } else {
              console.log(`No se encontró mapData para el beacon ${closest.identifier}`);
            }
          } catch (error) {
            console.log(`Error al obtener mapData para el beacon ${closest.identifier}:`, error);
          }
        }
      }
    }
  );
};

export const stopBeaconScanning = () => {
  bleManager.stopDeviceScan();
};
