/**
 * ShowMap.tsx
 *
 * This file defines the ShowMap component, which integrates the interactive map with the search interface.
 *
 * Key functionalities:
 * - Manages state for origin, destination, and a recommended origin (retrieved from AsyncStorage).
 * - Retrieves a recommended origin (e.g., from the closest beacon) and suggests it without auto-filling.
 * - Uses a state variable (currentBeacon) to keep the last valid beacon (current node) when a new one is not stable.
 * - Polls AsyncStorage periodically to update the current beacon automatically, but only after receiving
 *   the same beacon for 10 seconds continuously.
 * - Renders the Map component as a full-screen background and overlays the SearchBar on top using absolute positioning.
 * - When the Search button is pressed (with valid origin and destination), triggers the map to animate so that the 
 *   user's position (triangle) is centered.
 * - Passes a cancel callback to the Map component so that when the user confirms reaching the destination,
 *   the search is canceled.
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, TouchableOpacity, Text } from 'react-native';
import Map from './map';
import SearchBar from './searchBar';
import { Node } from '@/app/classes/node';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateGeom, updateMatrixWithDoors, Door } from './classes/geometry';
import { MapData, Path } from '@/app/classes/mapData';

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
  { x: 5, y: 3 }
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
  const [searchPressed, setSearchPressed] = useState(false);
  const [newTrip, setNewTrip] = useState<Path | null>(null);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [originError, setOriginError] = useState("");
  const [destinationError, setDestinationError] = useState("");
  const [currentBeacon, setCurrentBeacon] = useState<Node | null>(null);

  // This ref is used to debounce beacon updates.
  // It holds the candidate beacon and its associated timer.
  const candidateRef = useRef<{ node: Node; timer: NodeJS.Timeout | null } | null>(null);

  useEffect(() => {
    getClosestBeacon();
  }, []);

  const handleSearch = () => {
    if (origin && !places[origin]) {
      setOriginError("The origin location does not exist.");
    } else {
      setOriginError("");
    }
    if (destination && !places[destination]) {
      setDestinationError("The destination location does not exist.");
    } else {
      setDestinationError("");
    }
    if (places[origin] && places[destination]) {
      setSearchPressed(true);
      // In preview mode, set a new trip if needed (if applicable)
      if (isPreview) {
        setNewTrip({ origin: places[origin], destination: places[destination] });
      }
    }
  };

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

  // Retrieve the beacon node based on the stored identifier.
  const beaconNode = closestBeacon
    ? (Object.entries(places).find(([, node]) => node.id === closestBeacon)?.[1] || null)
    : null;

  // Debounce logic: update the current beacon only if the same beacon is received for 10 seconds.
  useEffect(() => {
    if (beaconNode) {
      // If there's no candidate or the candidate is different from the new beacon,
      // clear any existing timer and set a new candidate with a new timer.
      if (!candidateRef.current || candidateRef.current.node.id !== beaconNode.id) {
        if (candidateRef.current?.timer) {
          clearTimeout(candidateRef.current.timer);
        }
        candidateRef.current = {
          node: beaconNode,
          timer: setTimeout(() => {
            setCurrentBeacon(beaconNode);
            candidateRef.current = null;
          }, 1000),
        };
      }
      // If candidateRef.current exists and its node is the same as beaconNode,
      // we simply wait for the timer to finish.
    } else {
      // If no beacon is detected, clear the candidate.
      if (candidateRef.current?.timer) {
        clearTimeout(candidateRef.current.timer);
      }
      candidateRef.current = null;
    }
  }, [beaconNode]);

  // Poll for updated closest beacon from AsyncStorage every second.
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
            // When a new beacon is detected, the useEffect above handles debouncing.
            if (!candidateRef.current || candidateRef.current.node.id !== node.id) {
              candidateRef.current = {
                node,
                timer: setTimeout(() => {
                  setCurrentBeacon(node);
                  candidateRef.current = null;
                }, 10000),
              };
            }
          }
        } else {
          if (candidateRef.current?.timer) {
            clearTimeout(candidateRef.current.timer);
          }
          candidateRef.current = null;
        }
      } catch (error) {
        console.error("Error polling for closest beacon:", error);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const isPreview = origin && places[origin] && beaconNode
    ? (places[origin].id !== beaconNode.id)
    : false;

  const mapCurrentNode = isPreview ? null : currentBeacon;

  // Callback to cancel the search, used when the user confirms the destination reached
  const cancelSearch = () => {
    setSearchPressed(false);
  };

  return (
    <View style={styles.container}>
      <Map 
        mapData={mapData}
        origin={origin ? places[origin] : null} 
        destination={destination ? places[destination] : null}
        current_node={mapCurrentNode}
        searchPressed={searchPressed}
        centerTrigger={centerTrigger}
        isPreview={isPreview}
        newTrip={newTrip}
        onCancelSearch={cancelSearch}
      />
      <View style={styles.overlayContainer}>
        {searchPressed ? (
          <View style={styles.cancelButtonContainer}>
            <Button title="Cancel" onPress={cancelSearch} />
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
