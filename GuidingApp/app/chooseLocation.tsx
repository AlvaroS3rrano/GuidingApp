import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AddressInput from './components/AddressInput';
import CustomBtn from './components/customBtn';
import { router } from 'expo-router';

const ChooseLocation: React.FC = () => {
  
  const onDone = () => {
    router.back();
  };

  const fetchStartingCoords = (coordinates: { latitude: number, longitude: number }) => {
    console.log('Starting coordinates:', coordinates);
    // Aquí puedes guardar las coordenadas o hacer alguna otra operación
  };

  const fetchDestinationCoords = (coordinates: { latitude: number, longitude: number }) => {
    console.log('Destination coordinates:', coordinates);
    // Aquí puedes guardar las coordenadas o hacer alguna otra operación
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled" 
        style={{ backgroundColor: 'white', flex: 1, padding: 12 }}
      >
        <AddressInput 
          placeholderText="Search starting point"
          fetchAddress={fetchStartingCoords} 
        />
        <View style={{ marginBottom: 16 }} />
        <AddressInput 
          placeholderText="Search destination point"
          fetchAddress={fetchDestinationCoords}  
        />

        <CustomBtn
          btnText="Done"
          btnStyle={{ marginTop: 24 }}
          onPress={onDone}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChooseLocation;
