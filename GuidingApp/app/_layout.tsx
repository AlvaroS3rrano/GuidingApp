import 'react-native-gesture-handler';

import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Platform, StatusBar as RNStatusBar } from "react-native";
import { Slot } from "expo-router";
import { startBeaconScanning, stopBeaconScanning } from "../app/services/beaconScannerService";
import ErrorBanner from "@/app/components/errorBanner";
import { AppProvider } from './AppContext';
import { NavigationController } from './services/NavigationService';
import { StatusBar } from 'expo-status-bar';

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
        <StatusBar style="dark" backgroundColor="transparent"/>
        <View style={styles.safeArea}>
          <Slot />
          <NavigationController />
          <ErrorBanner />
        </View>
      </GestureHandlerRootView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 24 : 0, // Añade espacio en Android
  },
});
