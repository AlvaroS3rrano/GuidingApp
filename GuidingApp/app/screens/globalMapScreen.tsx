import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, Image, Modal } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { MapViewRoute } from 'react-native-maps-routes';
import { MaterialIcons } from '@expo/vector-icons';
import ChooseDestination from '../components/globalMapComponents/chooseDestination';
import ClosestMapBanner from '../components/closestMapBanner';
import { KEY_2 } from '../constants/public_key';
import { AppContext } from '../AppContext';
import { goToShowMap } from '../services/NavigationService';

const GlobalMapScreen = () => {
  const [origin, setOrigin] = useState<Region | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const { targetMapData, currentBeacon } = useContext(AppContext);

  useEffect(() => {
    if (currentBeacon && targetMapData) {
      const isEntrance = targetMapData.nodes.some(
        n => n.id === currentBeacon.id && currentBeacon.entrance
      );
      if (isEntrance) goToShowMap();
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
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setOrigin({
          latitude,
          longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      },
      error => console.log('Error watching position:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 2000,
        fastestInterval: 1000,
      }
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setOrigin({
          latitude,
          longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      },
      error => console.log('Error fetching location:', error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const centerMapOnUser = () => {
    if (origin && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    }
  };

  if (!origin) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal transparent visible={isSearchVisible} animationType="fade">
        <View style={styles.modalWrapper}>
          <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.searchContainer}>
            <ChooseDestination isSearchVisible={isSearchVisible} />
          </View>
        </View>
      </Modal>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={origin}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
      >
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

        {origin && destination && (
          <MapViewRoute
            origin={{ latitude: origin.latitude, longitude: origin.longitude }}
            destination={destination}
            apiKey={KEY_2}
            strokeColor="#000"
            strokeWidth={6}
            onError={errorMessage => console.log('Route error:', errorMessage)}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.centerButton} onPress={centerMapOnUser}>
        <MaterialIcons name="my-location" size={24} color="black" />
      </TouchableOpacity>

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
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalWrapper: { flex: 1, justifyContent: 'flex-start' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  searchContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 300, backgroundColor: 'white', elevation: 8, shadowColor: 'black', shadowOpacity: 0.2, shadowRadius: 3.5 },
  searchButton: { position: 'absolute', top: 10, left: 10, backgroundColor: 'white', padding: 10, borderRadius: 30, elevation: 5, opacity: 0.8 },
  centerButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'white', padding: 10, borderRadius: 15, elevation: 5, opacity: 0.7 },
});

export default GlobalMapScreen;
