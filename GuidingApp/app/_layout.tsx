import 'react-native-gesture-handler';

import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { startBeaconScanning, stopBeaconScanning } from "../app/services/beaconScannerService";
import ErrorBanner from "@/app/components/errorBanner";
import { AppProvider } from './AppContext';

export default function RootLayout() {
  useEffect(() => {
    startBeaconScanning();
    return () => {
      stopBeaconScanning();
    };
  }, []);

  return (
    <AppProvider>
      <GestureHandlerRootView style={styles.container}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="screens/showMapScreen" options={{ headerTitle: "Map" }} />
        </Stack>
        <ErrorBanner />
      </GestureHandlerRootView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
