// showMap.tsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, View, Button, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard, } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Map from '../components/showMapComponents/map';
import { beaconEventEmitter, ScannedDevice } from '@/app/services/beaconScannerService';
import { MapDataDTO, NodeDTO, Path } from '@/app/classes/DTOs';
import InfoBanner from '../components/showMapComponents/infoBanner';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext} from '../AppContext';
import ChooseDestination from '../components/globalMapComponents/chooseDestination';

/**
 * ShowMap.tsx
 *
 * This component integrates the interactive map with the beacon scanning service.
 * It subscribes to beacon updates from the BeaconScannerService for real-time beacon data.
 * All error handling has been moved to the global ErrorBanner component in _layout.tsx.
 */
const ShowMapScreen: React.FC = () => {

  const { mapData } = useLocalSearchParams<{ mapData?: string }>();

  let parsedMapData: MapDataDTO | null = null;  
         
  if (mapData) {
    try {
      parsedMapData = JSON.parse(mapData) as MapDataDTO;
    } catch (error) {
      console.error('Error parsing mapData:', error);
    }
  }

  const [closestBeacon, setClosestBeacon] = useState<string | null>(null);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [currentBeacon, setCurrentBeacon] = useState<NodeDTO | null>(null);

  // Ref to debounce beacon updates.
  const candidateRef = useRef<{ node: NodeDTO; timer: NodeJS.Timeout | null } | null>(null);

  const { targetNode, setTargetNode, targetMapData, setTargetMapData } = useContext(AppContext);

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
      }
    };

    beaconEventEmitter.on("update", updateHandler);

    return () => {
      beaconEventEmitter.off("update", updateHandler);
    };
  }, []);

  // Debounce logic: update current beacon only if the same beacon is received consistently.
  useEffect(() => {
    const beaconNode = closestBeacon && parsedMapData && parsedMapData.nodes
      ? (Object.entries(parsedMapData.nodes).find(([, node]) => node.beaconId === closestBeacon)?.[1] || null)
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
  }, [closestBeacon, parsedMapData]);
  
  // Available floors and selected floor
  const floors = parsedMapData
    ? Array.from(new Set(parsedMapData.nodes.map(n => n.floorNumber))).sort((a, b) => a - b)
    : [];
  const [selectedFloor, setSelectedFloor] = useState<number>(
    () => currentBeacon?.floorNumber ?? floors[0] ?? 0
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        
        {parsedMapData ? (
          <>
            <Map 
              mapData={parsedMapData}
              destination={targetNode}
              current_node={currentBeacon}
              centerTrigger={centerTrigger}
              selectedFloor={selectedFloor}
            />

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <ChooseDestination isSearchVisible={true} />
            </View>
    
            <TouchableOpacity
              style={styles.centerButton}
              onPress={() => setCenterTrigger(prev => prev + 1)}
            >
              <MaterialIcons name="my-location" size={24} color="black" />
            </TouchableOpacity>

            {/*  Floor switcher */}
            {floors.length > 1 && (
              <View style={styles.floorSwitcher}>
                <TouchableOpacity
                  disabled={floors.indexOf(selectedFloor) === 0}
                  onPress={() => {
                    const idx = floors.indexOf(selectedFloor);
                    setSelectedFloor(floors[idx - 1]);
                  }}
                >
                  <Text style={styles.arrow}>⬇️</Text>
                </TouchableOpacity>

                <Text style={styles.floorLabel}>Piso {selectedFloor}</Text>

                <TouchableOpacity
                  disabled={floors.indexOf(selectedFloor) === floors.length - 1}
                  onPress={() => {
                    const idx = floors.indexOf(selectedFloor);
                    setSelectedFloor(floors[idx + 1]);
                  }}
                >
                  <Text style={styles.arrow}>⬆️</Text>
                </TouchableOpacity>
                <InfoBanner/>
              </View>
            )}
          </>
        ) : (
          <Text>Map data is not available</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
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
   searchWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
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
  floorSwitcher: {
    position: 'absolute',
    bottom: 80,           // sobre el botón de centrar
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 32,
    marginHorizontal: 20,
    opacity: 0.8,
  },
  floorLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ShowMapScreen;
