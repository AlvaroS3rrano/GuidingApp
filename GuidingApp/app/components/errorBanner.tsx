// errorBanner.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { beaconEventEmitter } from '@/app/services/beaconScannerService';

/**
 * ErrorBanner component listens for error events from the beacon scanner.
 * The first time an error is detected, it automatically shows an Alert popup.
 * While the error persists, a yellow warning icon is displayed in the top-right corner.
 * Tapping the icon re-displays the error popup.
 */
const ErrorBanner: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoPopupShown, setAutoPopupShown] = useState(false);

  useEffect(() => {
    const errorHandler = (errMsg: string) => {
      setErrorMessage(errMsg);
      if (!autoPopupShown) {
        Alert.alert("Error", errMsg);
        setAutoPopupShown(true);
      }
    };

    const clearHandler = () => {
      // Clear error state when a successful update occurs.
      setErrorMessage(null);
      setAutoPopupShown(false);
    };

    beaconEventEmitter.on('error', errorHandler);
    beaconEventEmitter.on('update', clearHandler);

    return () => {
      beaconEventEmitter.off('error', errorHandler);
      beaconEventEmitter.off('update', clearHandler);
    };
  }, [autoPopupShown]);

  const handlePress = () => {
    if (errorMessage) {
      Alert.alert("Error", errorMessage);
    }
  };

  if (!errorMessage) return null;

  return (
    <TouchableOpacity style={styles.errorIcon} onPress={handlePress}>
      <Text style={styles.errorIconText}>⚠️</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  errorIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'yellow',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  errorIconText: {
    fontSize: 18,
    position: 'absolute',
    top: -0.5,
  }
});

export default ErrorBanner;
