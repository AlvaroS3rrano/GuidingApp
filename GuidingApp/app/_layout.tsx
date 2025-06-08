import 'react-native-gesture-handler';

import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { startBeaconScanning, stopBeaconScanning } from "../app/services/beaconScannerService";
import ErrorBanner from "@/app/components/errorBanner";
import { AppProvider } from './AppContext';
import { NavigationController } from './services/NavigationService';

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
        <Slot />
        <NavigationController />
        <ErrorBanner />
      </GestureHandlerRootView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
