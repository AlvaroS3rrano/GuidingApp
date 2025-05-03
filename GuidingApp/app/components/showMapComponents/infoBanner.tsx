import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { beaconEventEmitter } from '@/app/services/beaconScannerService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/**
 * InfoBanner component listens for informational events from the beacon scanner.
 * The first time an info event is detected, it automatically shows an Alert popup.
 * While the info persists, a blue information icon is displayed in the top-right corner.
 * Tapping the icon re-displays the info popup.
 */
const InfoBanner: React.FC = () => {
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [autoPopupShown, setAutoPopupShown] = useState(false);

  useEffect(() => {
    const infoHandler = (msg: string) => {
      setInfoMessage(msg);
    };

    const clearHandler = () => {
      setInfoMessage(null);
      setAutoPopupShown(false);
    };

    beaconEventEmitter.on('info', infoHandler);
    beaconEventEmitter.on('updateInfo', clearHandler);

    return () => {
      beaconEventEmitter.off('info', infoHandler);
      beaconEventEmitter.off('updateInfo', clearHandler);
    };
  }, [autoPopupShown]);

  const handlePress = () => {
    if (infoMessage) {
      Alert.alert('Info', infoMessage);
    }
  };

  if (!infoMessage) return null;

  return (
    <TouchableOpacity style={styles.infoIcon} onPress={handlePress}>
      <MaterialCommunityIcons name="information-variant" size={24} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  infoIcon: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  infoIconText: {
    fontSize: 18,
    color: 'white',
    position: 'absolute',
    top: -0.5,
  },
});

export default InfoBanner;
