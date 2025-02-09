/**
 * ShowMap.tsx - A React Native component for displaying a map with search functionality.
 *
 * This component allows users to search for predefined locations and visualize their positions on a map.
 * It also includes a feature to retrieve and display the closest detected beacon identifier, stored using AsyncStorage.
 */

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Button, Text, View } from 'react-native';
import Map from './map';
import SearchBar from './searchBar';
import { Dot } from '@/resources/geometry';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dictionary of predefined locations, where each key (string) has a Dot (coordinate) value
const places: Record<string, Dot> = {
  'Or': [13, 2], // Coordinates for "origin"
  'Des': [3, 8], // Coordinates for "destination"
};

// Main component that manages search functionality and map visualization
const ShowMap: React.FC = () => {
  // State variables to store user-inputted origin and destination
  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [closestBeacon, setClosestBeacon] = useState<string | null>(null);

  // Function triggered when the user presses "Search" in SearchBar
  const handleSearch = (origin: string, destination: string) => {
    if (places[origin] && places[destination]) {
      setOrigin(origin);
      setDestination(destination);
    } else {
      console.warn("Location not found in the dictionary.");
    }
  };

  // Function to retrieve the closest beacon identifier from AsyncStorage
  const getClosestBeacon = async () => {
    try {
      const identifier = await AsyncStorage.getItem('closestBeacon');
      if (identifier) {
        setClosestBeacon(identifier);
      } else {
        console.warn("No beacon stored.");
      }
    } catch (error) {
      console.error("Error retrieving the closest beacon", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search component where the user inputs origin and destination */}
      <SearchBar onSearch={handleSearch} />

      {/* Map component receiving the corresponding coordinates for origin and destination */}
      <Map 
        origin={origin ? places[origin] : null} 
        destination={destination ? places[destination] : null} 
      />
      
      {/* Button to retrieve the closest beacon identifier */}
      <Button title="Get Closest Beacon" onPress={getClosestBeacon} />
      {closestBeacon && <Text>Closest Beacon: {closestBeacon}</Text>}
    </SafeAreaView>
  );
};

// 🔹 Styles for the main container
const styles = StyleSheet.create({
  container: {
    flex: 1,                // Occupies full screen
    backgroundColor: '#fff', // White background
    justifyContent: 'center', // Center elements on the screen
    alignItems: 'center',   // Align elements horizontally at the center
  },
});

// 🔹 Export the component for use in other files
export default ShowMap;
