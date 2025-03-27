// _layout.tsx
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { startBeaconScanning, stopBeaconScanning } from "../app/services/beaconScannerService";
import ErrorBanner from "@/app/components/errorBanner"; 
import MapDataLogger from "./mapDataLogger";

export default function RootLayout() {
  useEffect(() => {
    // Start beacon scanning when the layout mounts.
    startBeaconScanning();

    return () => {
      stopBeaconScanning();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen name="index" options={{ headerTitle: "Show Beacons" }} />
        <Stack.Screen name="showMap" options={{ headerTitle: "Map" }} />
      </Stack>
      <MapDataLogger />
      <ErrorBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
