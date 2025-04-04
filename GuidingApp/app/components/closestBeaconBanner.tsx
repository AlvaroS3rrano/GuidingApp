// ClosestBeaconBanner.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { beaconEventEmitter } from '@/app/services/beaconScannerService';

/**
 * ClosestBeaconBanner component listens for "closestBeacon" events from the beacon scanner.
 * When a closest beacon is determined, it displays an Alert popup with Accept and Cancel options.
 * If the user cancels, a fallback icon appears in the top-right corner; tapping it re-displays the Alert.
 */
const ClosestBeaconBanner: React.FC = () => {
  const [closestBeacon, setClosestBeacon] = useState<string | null>(null);
  const [popupShown, setPopupShown] = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);

  const showClosestBeaconAlert = (beaconId: string) => {
    Alert.alert(
      "Closest Beacon",
      `The closest beacon is ${beaconId}`,
      [
        {
          text: "Accept",
          onPress: () => {
            // Al aceptar, se oculta el fallback y se marca el popup como mostrado.
            setPopupShown(true);
            setFallbackVisible(false);
          },
        },
        {
          text: "Cancel",
          onPress: () => {
            // Si se cancela, se muestra el fallback y no se marca el popup como mostrado.
            setPopupShown(false);
            setFallbackVisible(true);
          },
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const closestHandler = (beaconId: string) => {
      setClosestBeacon(beaconId);
      // Solo muestra el popup si aún no se mostró ni se tiene visible el fallback.
      if (!popupShown && !fallbackVisible) {
        showClosestBeaconAlert(beaconId);
      }
    };

    // Solo suscribirse al evento "closestBeacon" y no limpiar el estado en "update".
    beaconEventEmitter.on('closestBeacon', closestHandler);

    return () => {
      beaconEventEmitter.off('closestBeacon', closestHandler);
    };
  }, [popupShown, fallbackVisible]);

  // Al pulsar el fallback, se reabre el Alert.
  const handleFallbackPress = () => {
    if (closestBeacon) {
      showClosestBeaconAlert(closestBeacon);
    }
  };

  return (
    <>
      {fallbackVisible && (
        <TouchableOpacity style={styles.fallbackIcon} onPress={handleFallbackPress}>
          <Text style={styles.fallbackIconText}>ⓘ</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fallbackIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'lightblue',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  fallbackIconText: {
    fontSize: 18,
    color: 'black',
  },
});

export default ClosestBeaconBanner;
