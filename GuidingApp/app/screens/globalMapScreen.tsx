import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, Image, Modal } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { MapViewRoute } from 'react-native-maps-routes';
import { MaterialIcons } from '@expo/vector-icons';
import ChooseDestination from '../components/globalMapComponents/chooseDestination';
import ClosestMapBanner from '../components/closestMapBanner';
import { KEY_2 } from '../constants/public_key';
import DestinationAlert from '../components/DestinationAlert';
import { AppContext} from '../AppContext';
import { goToShowMap } from '../services/NavigationService';

const GlobalMapScreen = () => {
  const [origin, setOrigin] = useState<Region | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [hasApproachAlerted, setHasApproachAlerted] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const { targetMapData, currentBeacon} = useContext(AppContext);
  console.log(currentBeacon)
  useEffect(() => {
    if (currentBeacon && targetMapData) {
      const isEntrance = targetMapData.nodes.some(
        n => n.id === currentBeacon.id && currentBeacon.entrance
      );
      if (isEntrance) {
        goToShowMap();
      }
    }
  }, [currentBeacon, targetMapData]);

  useEffect(() => {
    if (targetMapData) {
      setDestination({
        latitude: targetMapData.latitude,
        longitude: targetMapData.longitude,
      });
    } else {
      setDestination(null);
    }
  }, [targetMapData]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log('Location fetched successfully:', position.coords); // Debugging log
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
        console.log('Error fetching location:', error);  // Debugging error
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  };

  // Function to center the map on the user's current location
  const centerMapOnUser = () => {
    if (origin && mapRef.current) {
      console.log('Centering map to:', origin);  // Debugging log
      mapRef.current.animateToRegion({
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      console.log('Origin or mapRef is null, cannot center map.');
    }
  };

   // Simple Haversine formula to get meters between two coords
  const getDistanceInMeters = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (origin && destination && !hasApproachAlerted) {
      const dist = getDistanceInMeters(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      // If within 5 m, trigger alert
      if (dist <= 5) {
        setHasApproachAlerted(true);
      }
    }
  }, [origin, destination, hasApproachAlerted]);

  // If no origin, show loading
  if (!origin) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Modal
        transparent
        visible={isSearchVisible}
        animationType="fade"
      >
        <View style={styles.modalWrapper}>
          <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <View style={styles.searchContainer}>
            <ChooseDestination
              isSearchVisible={isSearchVisible}
            />
          </View>
        </View>
      </Modal>

      {hasApproachAlerted && (
        <DestinationAlert onCancelSearch={() => setDestination(null)} />
      )}
      
      <MapView
        ref={mapRef}  // Make sure the ref is correctly assigned
        style={styles.map}
        initialRegion={origin}
        showsUserLocation={true}
        showsCompass={false}
        showsMyLocationButton={false}  // Disable the default "center" button
      >
        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            anchor={{ x: 0.5, y: 1 }}
          >
            <Image
              source={require('../../assets/images/race_flag.png')}
              style={{ width: 52, height: 52 }}
              resizeMode="contain"
            />
          </Marker>
        )}
        {/* Draw route if destination exists */}
        {origin && destination && (
          <MapViewRoute
            origin={{ latitude: origin.latitude, longitude: origin.longitude }}
            destination={destination}
            apiKey={KEY_2}
            strokeColor="#000"
            strokeWidth={6}
            onError={(errorMessage) => {
              console.log('Error in MapViewDirections: ', errorMessage);
            }}
          />
        )}
      </MapView>

      {/* Custom Center Button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerMapOnUser}  // Trigger the centering
      >
        <MaterialIcons name="my-location" size={24} color="black" />
      </TouchableOpacity>

      {/* Search Button */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setSearchVisible(!isSearchVisible)}
      >
        <MaterialIcons name="search" size={24} color="black" />
      </TouchableOpacity>
      
      <ClosestMapBanner />
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
   modalWrapper: {
    flex: 1,
    justifyContent: 'flex-start', // o 'center' si quieres centrar verticalmente
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    // opcional: oscurecer el fondo
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  searchButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    opacity: 0.8,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 300,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
    elevation: 5,
    opacity: 0.7,
  },
});

export default GlobalMapScreen;
