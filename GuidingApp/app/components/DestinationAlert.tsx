import React, { useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { AppContext} from '../AppContext';

type DestinationAlertProps = {
  onCancelSearch?: () => void;
};

const DestinationAlert: React.FC<DestinationAlertProps> = () => {
  const { setTargetNode, setTargetMapData } = useContext(AppContext);

  useEffect(() => {
    Alert.alert(
      'Destination Reached',
      'You have arrived at your destination!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {setTargetMapData(null); setTargetNode(null);} },
      ],
      { cancelable: true }
    );
  }, []);

  return null;
};

export default DestinationAlert;
