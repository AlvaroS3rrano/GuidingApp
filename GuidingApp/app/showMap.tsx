/**
 * ShowMap.tsx
 *
 * This file defines the ShowMap component, which integrates the interactive map with the search interface.
 *
 * Key functionalities:
 * - Manages state for origin, destination, and a recommended origin (retrieved from AsyncStorage).
 * - Automatically retrieves a recommended origin (e.g., from the closest beacon) and suggests it without auto-filling.
 * - Renders the Map component as a full-screen background and overlays the SearchBar on top using absolute positioning.
 * - When the Search button is pressed (with valid origin and destination), triggers the map to animate so that the 
 *   user's position (triangle) is centered.
 *
 * Usage:
 * - Passes the necessary props to the Map and SearchBar components.
 * - Updates the user sensor position based on the search action, which is then used to center the map.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Map from './map';
import SearchBar from './searchBar';
import { Node } from '@/app/classes/node';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Dictionary mapping node names to Node objects
const places: Record<string, Node> = {
  'Or': or,
  'Des': des,
};

const ShowMap: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [closestBeacon, setClosestBeacon] = useState<string | null>(null);
  const [originSuggestion, setOriginSuggestion] = useState<string>('');
  // Flag to indicate that Search was pressed
  const [searchPressed, setSearchPressed] = useState(false);

  useEffect(() => {
    getClosestBeacon();
  }, []);

  const handleSearch = () => {
    if (places[origin] && places[destination]) {
      setSearchPressed(true);
    } else {
      console.warn("Location not found in the dictionary.");
    }
  };

  const getClosestBeacon = async () => {
    try {
      const identifier = await AsyncStorage.getItem('closestBeacon');
      if (identifier) {
        setClosestBeacon(identifier);
        const matchingEntry = Object.entries(places).find(
          ([, node]) => node.id === identifier
        );
        if (matchingEntry) {
          const [nodeName] = matchingEntry;
          setOriginSuggestion(nodeName);
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

  // In this implementation, userSensor will be used by Map to draw the triangle in its position.
  // After search, Map will animate the pan so that the triangle is centered.
  const currentNode =
    origin && destination && closestBeacon
      ? Object.entries(places).find(([, node]) => node.id === closestBeacon)?.[1] || null
      : null;

  return (
    <View style={styles.container}>
      <Map 
        origin={origin ? places[origin] : null} 
        destination={destination ? places[destination] : null}
        current_node={currentNode}
        searchPressed={searchPressed}
      />
      <View style={styles.searchBarContainer}>
        <SearchBar
          origin={origin}
          destination={destination}
          recommendedOrigin={originSuggestion}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onSearch={() => {
            handleSearch();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
  },
});

export default ShowMap;
