// GlobalMap.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { API_KEY } from "@/app/constants/consts";
import { navigate } from 'expo-router/build/global-state/routing';
import { useRouter } from 'expo-router';

const GlobalMap = () => {
  const [origin, setOrigin] = useState<Region | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);

  const router = useRouter();

  const onPressLocation = () => {
    router.push({
      pathname: '/chooseLocation',
    });
  }

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Permiso de Ubicación',
              message: 'Esta aplicación necesita acceder a tu ubicación para el guidado en exteriores.',
              buttonNeutral: 'Preguntar luego',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK'
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          } else {
            console.log('Permiso de ubicación denegado');
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        getCurrentLocation();
      }
    };

    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const currentRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setOrigin(currentRegion);
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Si no hay origen, mostramos un loading
  if (!origin) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <MapView
        style={styles.map}
        initialRegion={origin}
        showsUserLocation={true}
      >
        {/* Marcador para la ubicación de origen */}
        <Marker
          coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
          title="Estás aquí"
        />
        {/* Marcador para el destino, si existe */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destino"
            pinColor="green"
          />
        )}
        {/* Dibujar ruta si se ha seleccionado destino */}
        {origin && destination && (
          <MapViewDirections
            origin={{ latitude: origin.latitude, longitude: origin.longitude }}
            destination={destination}
            apikey={API_KEY}
            strokeWidth={4}
            strokeColor="blue"
            onError={(errorMessage) => {
              console.log('Error en MapViewDirections: ', errorMessage);
            }}
          />
        )}
      </MapView>
      <View>
        <Text>
            Where are you going..?
        </Text>
        <TouchableOpacity
          style={styles.inputStyle}
          onPress={onPressLocation}
          >
            <Text>Choose your location</Text>

        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    width: '90%',
    alignSelf: 'center',
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    color: '#5d5d5d',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
  inputStyle: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginTop: 16
  }
});

export default GlobalMap;
