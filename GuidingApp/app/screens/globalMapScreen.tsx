import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity, Text, TouchableWithoutFeedback, Image } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { MapViewRoute } from 'react-native-maps-routes';
import { MaterialIcons } from '@expo/vector-icons';
import ChooseDestination from '../components/globalMapComponents/chooseDestination';
import ClosestMapBanner from '../components/closestMapBanner';  // Import ClosestMapBanner
import { KEY_2 } from '../constants/public_key';

const GlobalMapScreen = () => {
  const [origin, setOrigin] = useState<Region | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const searchRef = useRef<View | null>(null);
  const mapRef = useRef<MapView | null>(null);  // Reference to the MapView

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location for outdoor navigation.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          } else {
            console.log('Location permission denied');
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

  const handleOutsidePress = (e: any) => {
    // Check if the touch is outside the search component
    if (searchRef.current) {
      searchRef.current.measure((fx, fy, width, height, px, py) => {
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        if (touchX < px || touchX > px + width || touchY < py || touchY > py + height) {
          setSearchVisible(false);  // Hide search component if touch is outside
        }
      });
    }
  };

  // If no origin, show loading
  if (!origin) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
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

        {/* Choose Destination Component */}
        {isSearchVisible && (
          <View style={styles.searchContainer} ref={searchRef}>
            <ChooseDestination
              isSearchVisible={isSearchVisible}
              destination={destination} 
              onPress={setDestination}
            />
          </View>
        )}
        
        <ClosestMapBanner />
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
    opacity: 0.8,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
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
