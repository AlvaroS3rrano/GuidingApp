import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AddressInput from '../AddressInput';
import CustomBtn from '../customBtn';

interface ChooseDestinationProps {
  isSearchVisible: boolean;
  onPress: (destination: { latitude: number; longitude: number } | null) => void;
}

const ChooseDestination: React.FC<ChooseDestinationProps> = ({
  isSearchVisible,
  onPress,
}) => {
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchAddress = (coordinates: { latitude: number; longitude: number }) => {
    setDestination(coordinates);
  };

  const saveDestination = () => {
    onPress(destination)
    console.log("Destino guardado:", destination);
  };

  return (
    <View style={styles.container}>
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <AddressInput
            placeholderText="Buscar lugar..."
            fetchAddress={fetchAddress}
          />
        </View>
      )}

      {destination && (
        <View style={styles.destinationButtonContainer}>
          <CustomBtn
            onPress={saveDestination}
            btnText="Ir al destino"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1
  },
  searchContainer: {
    
  },
  destinationButtonContainer: {
    
  },
});

export default ChooseDestination;
