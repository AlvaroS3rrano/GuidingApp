import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AddressInput from './components/AddressInput';
import CustomBtn from './components/customBtn';

interface ChooseDestinationProps {
  isSearchVisible: boolean;
}

const ChooseDestination: React.FC<ChooseDestinationProps> = ({
  isSearchVisible,
}) => {
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchAddress = (coordinates: { latitude: number; longitude: number }) => {
    setDestination(coordinates);
  };

  const saveDestination = () => {
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
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,  // ocupa toda la pantalla
    zIndex: 2,
  },
  searchContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: 'white',
    padding: 20,
    elevation: 8,
  },
  destinationButtonContainer: {
    position: 'absolute',
    bottom: 30, left: 0, right: 0,
    alignSelf: 'center',
  },
});

export default ChooseDestination;
