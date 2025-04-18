import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'expo-google-places-autocomplete';
import { API_KEY } from './constants/consts';

const ChooseLocation: React.FC = () => {
  const onSearchError = useCallback((error: any) => {
    console.error(error);
  }, []);

  const onPlaceSelected = useCallback((place: any) => {
    console.log(place);
  }, []);

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        apiKey={API_KEY}
        requestConfig={{ countries: ['US'] }}
        onPlaceSelected={onPlaceSelected}
        onSearchError={onSearchError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  autocompleteContainer: {
    flex: 1,
    zIndex: 1,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 8,
    fontSize: 16,
  },
});

export default ChooseLocation;
