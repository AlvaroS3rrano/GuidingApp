import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import { API_KEY } from "@/app/constants/consts";
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // Importa íconos

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
      error => {
        console.log(error)
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 0 
      }
    );
  };

  const res = Geolocation.watchPosition(
    async position => {
      const { latitude, longitude } = position.coords;
      const currentRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    },
    error => {
      console.log("Error getting location ", error)
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 5000,
      useSignificantChanges: false,
      maximumAge: 0,
    }
  );

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
      
      <View style={styles.bottomCard}>
        <Text style={styles.titleText}>Where are you going..?</Text>
        <TouchableOpacity
          style={styles.inputStyle}
          onPress={onPressLocation}
        >
          <View style={styles.locationButton}>
            <MaterialIcons name="location-on" size={24} color="black" />
            <Text style={styles.buttonText}>Choose your location</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCard: {
    position: 'absolute',  // Esto hace que la tarjeta quede flotante sobre el mapa
    bottom: 0,             // Asegura que quede al fondo
    width: '100%',
    padding: 24,
    paddingBottom: 40,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo semi-transparente para que se vea el mapa detrás
    elevation: 8, // Sombra
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputStyle: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 48,
    justifyContent: 'center',
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
});

export default GlobalMap;
