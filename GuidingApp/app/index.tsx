/**
 * index.tsx - A React Native component for scanning BLE beacons.
 *
 * This component initializes a BLE scanner to detect nearby beacons, extract their identifiers,
 * and determine their distance using RSSI values. The closest beacon's identifier is stored
 * in AsyncStorage for later retrieval in other components.
 */

import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ListRenderItem } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import base64 from 'react-native-base64';
import requestPermissions from "@/resources/permissions";
import { calculateDistance } from "@/resources/distance";
import { Link } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

// BLE Manager instance used to control Bluetooth scanning
const bleManager = new BleManager();

// UUID of the target BLE service used to identify specific beacons
const TARGET_SERVICE_UUID = "0000fe9a-0000-1000-8000-00805f9b34fb";

// Interface defining the structure of scanned BLE devices
interface ScannedDevice {
  id: string;              // Unique identifier for the BLE device
  name: string | null;     // Name of the BLE device (if available)
  rssi: number | null;     // Signal strength indicator (Received Signal Strength Indication)
  identifier: string | null; // Extracted beacon identifier (if applicable)
  distance: number | null; // Estimated distance from the device based on RSSI
}

export default function BeaconScanner(): JSX.Element {
  const [devices, setDevices] = useState<ScannedDevice[]>([]); // List of detected BLE devices
  const [scanning, setScanning] = useState<boolean>(false); // State to track scanning status

  useEffect(() => {
    const checkPermissions = async () => {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted){
        console.warn("Bluetooth permissions not granted.");
      }
    };
    
    checkPermissions();
    return () => {
      bleManager.destroy(); // Cleanup BLE manager on component unmount
    };
  }, []);

  /**
   * Initiates BLE scanning to detect nearby beacons.
   * Extracts beacon identifiers, estimates distances, and stores the closest beacon in AsyncStorage.
   */
  const startScanning = () => {
    if (scanning) return;
    console.log("Scanning started.");
    setDevices([]);
    setScanning(true);

    bleManager.startDeviceScan([TARGET_SERVICE_UUID], null, async (error, scannedDevice) => {
      if (error) {
        console.warn("Scan error:", error);
        return;
      }

      // to get the identifier
      if (scannedDevice) {
        let identifier = null;
        if (scannedDevice.serviceData) {
          const serviceData = scannedDevice.serviceData[TARGET_SERVICE_UUID];
          if (serviceData) {
            const decodedData = base64.decode(serviceData);
            if (decodedData.charCodeAt(0) === 0x00) {
              identifier = decodedData.slice(1, 17)
                .split('')
                .map(char => ('0' + char.charCodeAt(0).toString(16)).slice(-2))
                .join('');
            }
          }
        }
        
        let distance = (scannedDevice.rssi) 
              ? calculateDistance(scannedDevice.rssi) 
              : null;


        setDevices((prevDevices) => {
          const newDevice = { id: scannedDevice.id, name: scannedDevice.name, rssi: scannedDevice.rssi, identifier, distance };
          const updatedDevices = [...prevDevices.filter(device => device.id !== scannedDevice.id), newDevice];

          // Determine the closest beacon based on distance
          const closest = updatedDevices.reduce<ScannedDevice | undefined>((closest, device) => {
            if (device.distance === null) return closest; // Ignore devices without valid distance
            if (!closest || (closest.distance !== null && device.distance < closest.distance)) {
              return device;
            }
            return closest;
          }, undefined);

          // Store the identifier of the closest beacon in AsyncStorage
          if (closest && closest.identifier) {
            AsyncStorage.setItem('closestBeacon', closest.identifier);
          }

          return updatedDevices;
        });
      }
    });
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
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
      />
      <Link href={"/showMap"} style={styles.button}>Map</Link>
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
