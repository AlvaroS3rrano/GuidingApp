/**
 * index.tsx - A React Native component for scanning BLE beacons.
 *
 * This component initializes a BLE scanner to detect nearby beacons, extract their identifiers,
 * and determine their distance using RSSI values. The closest beacon's identifier is stored
 * in AsyncStorage for later retrieval in other components.
 *
 * Enhancements for Android:
 * - Uses LowLatency scan mode with allowDuplicates and legacyScan enabled to maximize beacon detection.
 * - Ensures continuous scanning by reducing scan gaps.
 * - Retains a cleanup mechanism to remove devices that are not detected within 5 seconds.
 *
 * IMPORTANT: Ensure that your AndroidManifest.xml does not include the "neverForLocation" flag
 * on the BLUETOOTH_SCAN permission.
 */

import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ListRenderItem } from "react-native";
import { BleManager, Device, ScanMode } from "react-native-ble-plx";
import base64 from "react-native-base64";
import requestPermissions from "@/resources/permissions";
import { calculateDistance } from "@/resources/distance";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// BLE Manager instance used to control Bluetooth scanning
const bleManager = new BleManager();

// UUID of the target BLE service used to identify specific beacons
const TARGET_SERVICE_UUID = "0000fe9a-0000-1000-8000-00805f9b34fb";

// Interface defining the structure of scanned BLE devices
interface ScannedDevice {
  id: string;               // Unique identifier for the BLE device
  name: string | null;      // Name of the BLE device (if available)
  rssi: number | null;      // Signal strength indicator (RSSI)
  identifier: string | null;// Extracted beacon identifier (if applicable)
  distance: number | null;  // Estimated distance based on RSSI
  lastSeen: number;         // Timestamp when the device was last detected
}

export default function BeaconScanner(): JSX.Element {
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);

  useEffect(() => {
    // Check and request necessary Bluetooth permissions
    const checkPermissions = async () => {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        console.warn("Bluetooth permissions not granted.");
      }
    };

    checkPermissions();
    return () => {
      bleManager.destroy(); // Cleanup BLE manager on component unmount
    };
  }, []);

  // Set up an interval to remove devices that are no longer detected.
  // Every second, remove any device not seen in the last 5 seconds.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDevices(prevDevices =>
        prevDevices.filter(device => Date.now() - device.lastSeen < 5000) // 5000 ms threshold
      );
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  /**
   * Initiates BLE scanning to detect nearby beacons.
   * Extracts beacon identifiers, estimates distances, and stores the closest beacon in AsyncStorage.
   */
  const startScanning = () => {
    if (scanning) return;
    console.log("Scanning started.");
    setDevices([]); // Clear previously detected devices
    setScanning(true);

    bleManager.startDeviceScan(
      [TARGET_SERVICE_UUID],
      {
        allowDuplicates: true,
        scanMode: ScanMode.LowLatency, // Use aggressive scanning mode for maximum detection :contentReference[oaicite:2]{index=2}
        legacyScan: true,
      },
      async (error, scannedDevice) => {
        if (error) {
          console.warn("Scan error:", error);
          return;
        }

        if (scannedDevice) {
          let identifier = null;
          // Extract the identifier from service data if available
          if (scannedDevice.serviceData) {
            const serviceData = scannedDevice.serviceData[TARGET_SERVICE_UUID];
            if (serviceData) {
              const decodedData = base64.decode(serviceData);
              // Check if the first byte indicates valid data
              if (decodedData.charCodeAt(0) === 0x00) {
                identifier = decodedData
                  .slice(1, 17)
                  .split("")
                  .map(char => ("0" + char.charCodeAt(0).toString(16)).slice(-2))
                  .join("");
              }
            }
          }

          // Calculate the estimated distance using the RSSI value
          let distance = scannedDevice.rssi
            ? calculateDistance(scannedDevice.rssi)
            : null;

          // Create a new device object with the current timestamp as lastSeen
          const newDevice: ScannedDevice = {
            id: scannedDevice.id,
            name: scannedDevice.name,
            rssi: scannedDevice.rssi,
            identifier,
            distance,
            lastSeen: Date.now(),
          };

          // Update the devices list by replacing an existing device with the same id
          setDevices(prevDevices => {
            const updatedDevices = [
              ...prevDevices.filter(device => device.id !== scannedDevice.id),
              newDevice,
            ];

            // Determine the closest beacon based on distance
            const closest = updatedDevices.reduce<ScannedDevice | undefined>(
              (closest, device) => {
                if (device.distance === null) return closest;
                if (!closest || (closest.distance !== null && device.distance < closest.distance)) {
                  return device;
                }
                return closest;
              },
              undefined
            );

            // Store the identifier of the closest beacon in AsyncStorage if available
            if (closest && closest.identifier) {
              AsyncStorage.setItem("closestBeacon", closest.identifier);
            }

            return updatedDevices;
          });
        }
      }
    );
  };

  /**
   * Stops the BLE scanning process.
   */
  const stopScanning = () => {
    if (!scanning) return;
    bleManager.stopDeviceScan();
    setScanning(false);
    console.log("Scanning stopped.");
  };

  /**
   * Renders the scanned device list with details about each detected beacon.
   */
  const renderDevice: ListRenderItem<ScannedDevice> = ({ item }) => (
    <View style={styles.deviceContainer}>
      <Text style={styles.deviceText}>Name: {item.name || "Unknown Device"}</Text>
      <Text style={styles.deviceText}>ID: {item.id}</Text>
      <Text style={styles.deviceText}>RSSI: {item.rssi ?? "N/A"}</Text>
      <Text style={styles.deviceText}>Identifier: {item.identifier}</Text>
      <Text style={styles.deviceText}>Distance: {item.distance}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Start Scanning" onPress={startScanning} disabled={scanning} />
      <Button title="Stop Scanning" onPress={stopScanning} disabled={!scanning} />
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={renderDevice}
      />
      <Link href={"/showMap"} style={styles.button}>
        Map
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  deviceContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  deviceText: {
    fontSize: 14,
    color: "#333",
  },
  button: {
    fontSize: 20,
    textAlign: "center",
    textDecorationLine: "underline",
    color: "black",
  },
});
