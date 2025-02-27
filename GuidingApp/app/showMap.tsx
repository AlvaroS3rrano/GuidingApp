// showMap.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, TouchableOpacity, Text } from 'react-native';
import Map from './map';
import SearchBar from './searchBar';
import { Node } from '@/app/classes/node';
import { MapData, Path } from '@/app/classes/mapData';
import { beaconEventEmitter, ScannedDevice } from '@/app/services/beaconScannerService';
import { mapData, places } from '@/app/services/mapService';

/**
 * ShowMap.tsx
 *
 * This component integrates the interactive map with the beacon scanning service.
 * It subscribes to beacon updates from the BeaconScannerService for real-time beacon data.
 * All error handling has been moved to the global ErrorBanner component in _layout.tsx.
 */
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

  // Ref to debounce beacon updates.
  const candidateRef = useRef<{ node: Node; timer: NodeJS.Timeout | null } | null>(null);

  // Subscribe to beacon updates.
  useEffect(() => {
    const updateHandler = (devices: ScannedDevice[]) => {
      if (devices.length > 0) {
        // Determine the closest beacon based on distance.
        const closest = devices.reduce((prev, curr) => {
          if (prev.distance === null) return curr;
          if (curr.distance === null) return prev;
          return curr.distance < prev.distance ? curr : prev;
        }, devices[0]);
        setClosestBeacon(closest.identifier);
        // Update the recommended origin if a matching node is found.
        const matchingEntry = Object.entries(places).find(
          ([, node]) => node.id === closest.identifier
        );
        if (matchingEntry) {
          setOriginSuggestion(matchingEntry[0]);
        }
      }
    };

    beaconEventEmitter.on("update", updateHandler);

    return () => {
      beaconEventEmitter.off("update", updateHandler);
    };
  }, []);

  // Debounce logic: update current beacon only if the same beacon is received consistently.
  useEffect(() => {
    const beaconNode = closestBeacon
      ? (Object.entries(places).find(([, node]) => node.id === closestBeacon)?.[1] || null)
      : null;
    if (beaconNode) {
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
    } else {
      if (candidateRef.current?.timer) {
        clearTimeout(candidateRef.current.timer);
      }
      candidateRef.current = null;
    }
  }, [closestBeacon]);

  const isPreview: boolean =
    origin !== "" && places[origin] !== undefined && (places[origin].id !== (closestBeacon || ''));

  const mapCurrentNode = isPreview ? null : currentBeacon;

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

  // Cancel search callback.
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
