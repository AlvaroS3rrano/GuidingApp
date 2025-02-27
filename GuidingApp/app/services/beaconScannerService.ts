// BeaconScannerService.ts
import { BleManager, ScanMode } from "react-native-ble-plx";
import base64 from "react-native-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateDistance } from "@/resources/distance";
import requestPermissions from "@/resources/permissions";
import { EventEmitter } from "events";

// Event emitter to broadcast beacon list updates
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

export const startBeaconScanning = async () => {
  // Request necessary Bluetooth permissions
  const permissionsGranted = await requestPermissions();
  if (!permissionsGranted) {
    console.warn("Bluetooth permissions not granted.");
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

        // Update the devices list: remove any previous instance of the same device
        devices = devices.filter(device => device.id !== scannedDevice.id);
        devices.push(newDevice);

        // Remove devices not seen in the last 5 seconds
        devices = devices.filter(device => Date.now() - device.lastSeen < 5000);

        // Emit the updated devices list to listeners
        beaconEventEmitter.emit("update", devices);

        // Optionally, determine and store the closest beacon in AsyncStorage
        const closest = devices.reduce<ScannedDevice | undefined>(
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
          await AsyncStorage.setItem("closestBeacon", closest.identifier);
        }
      }
    }
  );
};

export const stopBeaconScanning = () => {
  bleManager.stopDeviceScan();
};
