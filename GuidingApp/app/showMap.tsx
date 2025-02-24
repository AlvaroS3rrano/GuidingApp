/**
 * ShowMap.tsx
 *
 * This file defines the ShowMap component, which integrates the interactive map with the search interface.
 *
 * Key functionalities:
 * - Manages state for origin, destination, and a recommended origin (retrieved from AsyncStorage).
 * - Automatically retrieves a recommended origin (e.g., from the closest beacon) and suggests it without auto-filling.
 * - Uses a state variable (currentBeacon) to keep the last valid beacon (current node) when a new one is not found.
 * - Polls AsyncStorage periodically to update the current beacon automatically.
 * - Renders the Map component as a full-screen background and overlays the SearchBar on top using absolute positioning.
 * - When the Search button is pressed (with valid origin and destination), triggers the map to animate so that the 
 *   user's position (triangle) is centered.
 *
 * Usage:
 * - Passes the necessary props to the Map and SearchBar components.
 * - Updates the user sensor position based on the search action, which is then used to center the map.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TouchableOpacity, Text } from 'react-native';
import Map from './map';
import SearchBar from './searchBar';
import { Node } from '@/app/classes/node';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import geometry functions to create the grid
import { generateGeom, updateMatrixWithDoors, Door } from './classes/geometry';
import { MapData, Path } from '@/app/classes/mapData'; // Import the MapData type

// Create Node instances using your existing Node class
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

const cent = new Node(
  "530801241127a8aad378170fdbabbd17",
  [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 5 }, { x: 0, y: 5 }],
  { x: 5, y: 3 } // Located at the door
);

// Create a mapping for node selection; keys are labels for user convenience
const places: Record<string, Node> = {
  'Or': or,
  'Des': des,
  'Cent': cent,
};

// Generate the initial map grid using your functions
let initialGrid: number[][] = generateGeom([
  { x: 0, y: 0 },
  { x: 15, y: 0 },
  { x: 15, y: 5 },
  { x: 10, y: 5 },
  { x: 10, y: 10 },
  { x: 0, y: 10 }
]);
const doors: Door[] = [
  [{ x: 15, y: 2 }, { x: 15, y: 3 }],
  [{ x: 10, y: 7 }, { x: 10, y: 8 }],
];
initialGrid = updateMatrixWithDoors(initialGrid, doors);

// Build the graph using the created nodes
const graph = {
  nodes: [or, cent, des],
  edges: [
    { from: or.id, to: cent.id, weight: 5 },
    { from: des.id, to: cent.id, weight: 5 },
    { from: cent.id, to: des.id, weight: 5 },
    { from: cent.id, to: or.id, weight: 5 },
  ]
};

// Create the MapData instance
const mapData: MapData = {
  name: "Ground Floor",
  initialMap: initialGrid,
  graph: graph,
};

const ShowMap: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [closestBeacon, setClosestBeacon] = useState<string | null>(null);
  const [originSuggestion, setOriginSuggestion] = useState<string>('');
  // Flag indicating that Search/Preview was pressed
  const [searchPressed, setSearchPressed] = useState(false);
  const [newTrip, setNewTrip] = useState<Path | null>(null);
  // Used to force re-centering of the map
  const [centerTrigger, setCenterTrigger] = useState(0);
  // Error messages for invalid inputs
  const [originError, setOriginError] = useState("");
  const [destinationError, setDestinationError] = useState("");

  // State to keep the last valid beacon (current node)
  const [currentBeacon, setCurrentBeacon] = useState<Node | null>(null);

  useEffect(() => {
    getClosestBeacon();
  }, []);

  const handleSearch = () => {
    // Validate origin using the places mapping
    if (origin && !places[origin]) {
      setOriginError("The origin location does not exist.");
    } else {
      setOriginError("");
    }
    // Validate destination using the places mapping
    if (destination && !places[destination]) {
      setDestinationError("The destination location does not exist.");
    } else {
      setDestinationError("");
    }
    // Proceed only if both origin and destination are valid
    if (places[origin] && places[destination]) {
      setSearchPressed(true);
      // In preview mode, set a new trip if needed
      if (isPreview) {
        setNewTrip({ origin: places[origin], destination: places[destination] });
      }
    }
  };

  // Handle origin input changes and clear error if valid
  const handleOriginChange = (text: string) => {
    setOrigin(text);
    if (places[text]) {
      setOriginError("");
    }
  };

  const handleDestinationChange = (text: string) => {
    setDestination(text);
    if (places[text]) {
      setDestinationError("");
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

  // Compute beaconNode using the places mapping
  const beaconNode = closestBeacon
    ? (Object.entries(places).find(([, node]) => node.id === closestBeacon)?.[1] || null)
    : null;

  // Update the currentBeacon state only when a valid beaconNode is found.
  // This ensures that if beaconNode becomes null, the last valid beacon is preserved.
  useEffect(() => {
    if (beaconNode) {
      setCurrentBeacon(beaconNode);
    }
  }, [beaconNode]);

  // Poll for updated closest beacon from AsyncStorage every second.
  // Since AsyncStorage does not have native listeners, we periodically check for updates.
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const identifier = await AsyncStorage.getItem('closestBeacon');
        if (identifier) {
          const matchingEntry = Object.entries(places).find(
            ([, node]) => node.id === identifier
          );
          if (matchingEntry) {
            const node = matchingEntry[1];
            // Update currentBeacon if it has changed
            if (!currentBeacon || currentBeacon.id !== node.id) {
              setCurrentBeacon(node);
            }
          }
        }
      } catch (error) {
        console.error("Error polling for closest beacon:", error);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [currentBeacon]);

  // Determine preview mode: active if origin exists, beaconNode exists, and they differ
  const isPreview = origin && places[origin] && beaconNode
    ? (places[origin].id !== beaconNode.id)
    : false;

  // For the map, if preview is active, do not show the user's sensor arrow.
  // Use the last valid beacon (currentBeacon) if not in preview mode.
  const mapCurrentNode = isPreview ? null : currentBeacon;

  return (
    <View style={styles.container}>
      {/* Render the map as background using the new MapData structure */}
      <Map 
        mapData={mapData}
        origin={origin ? places[origin] : null} 
        destination={destination ? places[destination] : null}
        current_node={mapCurrentNode}
        searchPressed={searchPressed}
        centerTrigger={centerTrigger}
        isPreview={isPreview}
        newTrip={newTrip}
      />
      {/* Overlay: display SearchBar or Cancel button based on searchPressed */}
      <View style={styles.overlayContainer}>
        {searchPressed ? (
          <View style={styles.cancelButtonContainer}>
            <Button title="Cancel" onPress={() => setSearchPressed(false)} />
          </View>
        ) : (
          <SearchBar
            origin={origin}
            destination={destination}
            recommendedOrigin={originSuggestion}
            onOriginChange={handleOriginChange}
            onDestinationChange={handleDestinationChange}
            onSearch={handleSearch}
            buttonTitle={isPreview ? "Preview" : "Search"}
            originError={originError}
            destinationError={destinationError}
          />
        )}
      </View>
      {/* Show center button if search is active */}
      {searchPressed && (
        <TouchableOpacity style={styles.centerButton} onPress={() => setCenterTrigger(prev => prev + 1)}>
          <Text style={styles.centerButtonText}>🎯</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
  },
  cancelButtonContainer: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  centerButtonText: {
    fontSize: 24,
  },
});

export default ShowMap;
