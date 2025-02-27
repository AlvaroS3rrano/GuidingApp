// index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { beaconEventEmitter, ScannedDevice } from "@/app/services/beaconScannerService";
import { Link } from "expo-router";

export default function BeaconListScreen() {
  const [devices, setDevices] = useState<ScannedDevice[]>([]);

  useEffect(() => {
    // Handler to update the devices state when the beacon list changes
    const updateHandler = (updatedDevices: ScannedDevice[]) => {
      setDevices(updatedDevices);
    };

    // Subscribe to beacon updates
    beaconEventEmitter.on("update", updateHandler);

    // Clean up subscription on component unmount
    return () => {
      beaconEventEmitter.off("update", updateHandler);
    };
  }, []);

  // Render function for each beacon item
  const renderItem = ({ item }: { item: ScannedDevice }) => (
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
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
