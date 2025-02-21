import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TouchableOpacity, Text } from 'react-native';
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
  // searchPressed indicates that the Search/Preview button was pressed and the overlay should switch
  const [searchPressed, setSearchPressed] = useState(false);
  // centerTrigger is incremented when the center button is pressed to force re-centering of the map
  const [centerTrigger, setCenterTrigger] = useState(0);
  // Error messages for invalid inputs
  const [originError, setOriginError] = useState("");
  const [destinationError, setDestinationError] = useState("");

  useEffect(() => {
    getClosestBeacon();
  }, []);

  const handleSearch = () => {
    // Validate origin
    if (origin && !places[origin]) {
      setOriginError("The origin location does not exist.");
    } else {
      setOriginError("");
    }
    // Validate destination
    if (destination && !places[destination]) {
      setDestinationError("The destination location does not exist.");
    } else {
      setDestinationError("");
    }
    // Proceed only if both origin and destination are valid
    if (places[origin] && places[destination]) {
      setSearchPressed(true);
    }
  };

  // Manejo personalizado de los cambios para borrar el error al ingresar un valor válido
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

  // Compute beaconNode regardless of destination
  const beaconNode = closestBeacon
    ? (Object.entries(places).find(([, node]) => node.id === closestBeacon)?.[1] || null)
    : null;

  // Determine preview mode: active if origin exists, beaconNode exists, and they differ
  const isPreview = origin && places[origin] && beaconNode ? (places[origin].id !== beaconNode.id) : false;

  // For the map, if preview is active, do not show the user's sensor arrow.
  const mapCurrentNode = isPreview ? null : beaconNode;

  return (
    <View style={styles.container}>
      {/* Map rendered as background */}
      <Map 
        origin={origin ? places[origin] : null} 
        destination={destination ? places[destination] : null}
        current_node={mapCurrentNode}
        searchPressed={searchPressed}
        centerTrigger={centerTrigger}
        isPreview={isPreview}
      />
      {/* Overlay container: display SearchBar or Cancel button based on searchPressed */}
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
            onOriginChange={handleOriginChange}  // Función personalizada para limpiar error
            onDestinationChange={handleDestinationChange}  // Función personalizada para limpiar error
            onSearch={handleSearch}
            buttonTitle={isPreview ? "Preview" : "Search"}
            originError={originError}
            destinationError={destinationError}
          />
        )}
      </View>
      {/* If search is active, show the center button in the bottom right */}
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
    //elevation: 2,
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
