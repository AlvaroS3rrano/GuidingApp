import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import { MapViewRoute } from 'react-native-maps-routes';
import { API_KEY} from "@/app/constants/consts";
import { MaterialIcons } from '@expo/vector-icons'; // Importa íconos
import ChooseDestination from './chooseDestination';
import { KEY_2 } from './constants/public_key';

const GlobalMap = () => {
  const [origin, setOrigin] = useState<Region | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearchVisible, setSearchVisible] = useState(false);  // Estado para controlar la visibilidad del input
  const searchRef = useRef<View | null>(null);  // Usamos un ref para el componente de búsqueda

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
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
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

  const handleOutsidePress = (e: any) => {
    // Verifica si el toque es fuera del componente de búsqueda usando 'measure'
    if (searchRef.current) {
      searchRef.current.measure((fx, fy, width, height, px, py) => {
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;

        // Verifica si las coordenadas del toque están fuera del componente de búsqueda
        if (touchX < px || touchX > px + width || touchY < py || touchY > py + height) {
          setSearchVisible(false);  // Oculta el componente de búsqueda si el toque es fuera
        }
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        {/* Mostrar MapView */}
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
            <MapViewRoute
              origin={{ latitude: origin.latitude, longitude: origin.longitude }}
              destination={destination}
              apiKey={KEY_2}
              strokeColor="#000"
              strokeWidth={6}
              onError={(errorMessage) => {
                console.log('Error en MapViewDirections: ', errorMessage);
              }}
            />
          )}
        </MapView>

        {/* Botón de lupa en la esquina izquierda */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchVisible(!isSearchVisible)}  // Cambiar la visibilidad del input
        >
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>

        {/* Componente ChooseDestination */}
        {isSearchVisible && (
          <View style={styles.searchContainer} ref={searchRef}>
            <ChooseDestination
              isSearchVisible={isSearchVisible} 
              onPress={setDestination}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
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
  searchButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    opacity: 0.8
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,  // Asegura que el input se superponga al mapa
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
});

export default GlobalMap;
