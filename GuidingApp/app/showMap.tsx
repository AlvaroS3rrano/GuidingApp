/**
 * ShowMap.tsx
 * 
 * This component manages the display of a map along with a search interface for selecting an origin and destination.
 * It integrates the SearchBar component to allow users to enter locations and displays a Map component that shows the corresponding nodes.
 * Additionally, it includes functionality to retrieve the closest beacon from AsyncStorage.
 * When both origin and destination are set, the component computes a current node (closestNode) based on the closest beacon identifier
 * and passes it to the Map component via the current_node prop.
 * 
 * Functionality:
 * - Maintains state for origin, destination, and the closest beacon identifier.
 * - Updates the origin field if the closest beacon matches a node in the places dictionary.
 * - Computes the current node (closestNode) from the closest beacon and passes it to the Map component if both origin and destination exist.
 */

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Button, Text } from 'react-native';
import Map from './map';
import SearchBar from './searchBar';
import { Node } from '@/app/classes/node';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Predefined nodes for the map. Each Node is initialized with an ID, an array of area points, and a sensor coordinate.
const or = new Node(
  "d4fcb04a6573ea399df3adbf06f91b38",
  [{ x: 10, y: 0 }, { x: 15, y: 0 }, { x: 15, y: 5 }, { x: 10, y: 5 }],
  { x: 13, y: 2 }
);
const des = new Node(
  "15c210b9f1ea2e121131bba29e8cc90a",
  [{ x: 0, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
  { x: 3, y: 8 }
);

// Dictionary mapping node names to their corresponding Node objects.
const places: Record<string, Node> = {
  'Or': or,
  'Des': des,
};

const ShowMap: React.FC = () => {
  // State for the origin and destination values displayed in the SearchBar.
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  // State for storing the closest beacon identifier.
  const [closestBeacon, setClosestBeacon] = useState<string | null>(null);

  // Function executed when the user presses the search button.
  const handleSearch = () => {
    if (places[origin] && places[destination]) {
      console.log("Search successful with:", origin, destination);
    } else {
      console.warn("Location not found in the dictionary.");
    }
  };

  // Function to retrieve the closest beacon identifier from AsyncStorage and update the origin field.
  const getClosestBeacon = async () => {
    try {
      const identifier = await AsyncStorage.getItem('closestBeacon');
      if (identifier) {
        setClosestBeacon(identifier);
        // Search for the node in the places dictionary that matches the retrieved beacon identifier.
        const matchingEntry = Object.entries(places).find(
          ([, node]) => node.id === identifier
        );
        if (matchingEntry) {
          const [nodeName] = matchingEntry;
          // Update the origin state with the node name so that it appears in the SearchBar.
          setOrigin(nodeName);
        } else {
          console.warn("No matching node found for the beacon identifier");
        }
      } else {
        console.warn("No beacon stored.");
      }
    } catch (error) {
      console.error("Error retrieving the closest beacon", error);
    }
  };

  // Compute the current node (closestNode) based on the closestBeacon state.
  // This is only computed if both origin and destination are provided.
  const currentNode =
    origin && destination && closestBeacon
      ? Object.entries(places).find(([, node]) => node.id === closestBeacon)?.[1] || null
      : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* SearchBar component with controlled inputs for origin and destination */}
      <SearchBar
        origin={origin}
        destination={destination}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onSearch={handleSearch}
      />
      
      {/* Map component receiving origin, destination, and current_node (closest node) if both origin and destination exist */}
      <Map 
        origin={origin ? places[origin] : null} 
        destination={destination ? places[destination] : null}
        current_node={currentNode}
      />
      
      {/* Button to fetch the closest beacon and update the origin field accordingly */}
      <Button title="Get Closest Beacon" onPress={getClosestBeacon} />
      {closestBeacon && <Text>Closest Beacon: {closestBeacon}</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShowMap;
