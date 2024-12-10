import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ListRenderItem } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const bleManager = new BleManager();

interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

export default function BeaconScanner(): JSX.Element {
  const [devices, setDevices] = useState<ScannedDevice[]>([]);

  useEffect(() => {
    return () => {
      bleManager.destroy(); // Cleanup BLE manager on component unmount
    };
  }, []);

  // Start scanning for BLE devices
  const startScanning = () => {
    setDevices([]); // Clear the current list of devices

    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.warn("Error during scan:", error);
        return;
      }

      if (scannedDevice) {
        // Avoid duplicates using device ID
        setDevices((prevDevices) => {
          const deviceExists = prevDevices.some(
            (device) => device.id === scannedDevice.id
          );
          if (!deviceExists) {
            return [
              ...prevDevices,
              {
                id: scannedDevice.id,
                name: scannedDevice.name,
                rssi: scannedDevice.rssi,
              },
            ];
          }
          return prevDevices;
        });
      }
    });
  };

  // Stop scanning for BLE devices
  const stopScanning = () => {
    bleManager.stopDeviceScan();
    console.log("Scanning stopped.");
  };

  // Render a list of devices
  const renderDevice: ListRenderItem<ScannedDevice> = ({ item }) => (
    <View style={styles.deviceContainer}>
      <Text style={styles.deviceText}>
        Name: {item.name || "Unknown Device"}
      </Text>
      <Text style={styles.deviceText}>ID: {item.id}</Text>
      <Text style={styles.deviceText}>RSSI: {item.rssi ?? "N/A"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Start Scanning" onPress={startScanning} />
      <Button title="Stop Scanning" onPress={stopScanning} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
      />
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
});