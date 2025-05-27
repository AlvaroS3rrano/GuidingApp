import React, { useEffect } from 'react';
import { Alert } from 'react-native';

type DestinationAlertProps = {
  onCancelSearch?: () => void;
};

const DestinationAlert: React.FC<DestinationAlertProps> = ({ onCancelSearch }) => {
  useEffect(() => {
    Alert.alert(
      'Destination Reached',
      'You have arrived at your destination!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => onCancelSearch?.() },
      ],
      { cancelable: true }
    );
  }, []);

  return null;
};

export default DestinationAlert;
