// _layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { startBeaconScanning, stopBeaconScanning } from "@/app/services/beaconScannerService";

export default function RootLayout() {
  useEffect(() => {
    // Start beacon scanning when the layout mounts
    startBeaconScanning();

    // Optionally, stop scanning when the layout unmounts
    return () => {
      stopBeaconScanning();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Show Beacons" }} />
      <Stack.Screen name="showMap" options={{ headerTitle: "Map" }} />
    </Stack>
  );
}
