import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'expo-google-places-autocomplete';
import { API_KEY } from '../constants/consts';

interface AddressInputProps {
  placeholderText: string;
  fetchAddress: (coordinates: { latitude: number, longitude: number }) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ placeholderText, fetchAddress }) => {
  const onSearchError = useCallback((error: any) => {
    console.error(error);
  }, []);

  const onPlaceSelected = useCallback((place: any) => {
    // Obtenemos las coordenadas del campo 'coordinate'
    const { latitude, longitude } = place.coordinate;

    // Llamamos a fetchAddress con las coordenadas
    fetchAddress({ latitude, longitude });
  }, [fetchAddress]);

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholderText}
        apiKey={API_KEY}
        requestConfig={{ countries: ['ES', 'US'] }}
        onPlaceSelected={onPlaceSelected}
        onSearchError={onSearchError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AddressInput;
