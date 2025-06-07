// showMap.tsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, View, Button, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard, } from 'react-native';
import Map from '../components/showMapComponents/map';
import { MapDataDTO, NodeDTO, Path } from '@/app/classes/DTOs';
import InfoBanner from '../components/showMapComponents/infoBanner';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext} from '../AppContext';
import ChooseDestination from '../components/globalMapComponents/chooseDestination';
import { NodeService } from '../services/nodeService';

/**
 * ShowMap.tsx
 *
 * This component integrates the interactive map with the beacon scanning service.
 * It subscribes to beacon updates from the BeaconScannerService for real-time beacon data.
 * All error handling has been moved to the global ErrorBanner component in _layout.tsx.
 */
const ShowMapScreen: React.FC = () => {

  const {
    currentBeacon,
    currentMapData,
    targetNode,
    targetMapData,
  } = useContext(AppContext);

  const [firstExitNode, setFirstExitNode] = useState<NodeDTO | null>(null);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [isSameMap, setIsSameMap] = useState<boolean>(false);

  console.log(currentBeacon)

  // When map changes, reset selected floor
  useEffect(() => {
    if (currentMapData) {
      const floors = Array.from(
        new Set(currentMapData.nodes.map(n => n.floorNumber))
      ).sort((a, b) => a - b);
      setSelectedFloor(floors[0] ?? 0);
    }
  }, [currentMapData]);

  // Fetch first exit node when switching targets or map
  useEffect(() => {
    if (!currentMapData) {
      setFirstExitNode(null);
      return;
    }
    if (!targetMapData) {
      setFirstExitNode(null);
      return;
    }

    const parsedMapId = currentMapData.id;
    setIsSameMap(targetMapData.id === parsedMapId);
    if (!isSameMap) {
      NodeService.getExitNodesByMapDataId(parsedMapId)
        .then(nodes => setFirstExitNode(nodes[0] ?? null))
        .catch(err => {
          console.error('Error fetching exit nodes:', err);
          setFirstExitNode(null);
        });
    } else {
      setFirstExitNode(null);
    }
  }, [currentMapData?.id, targetMapData?.id]);

  // Prepare floors array
  const floors = currentMapData
    ? Array.from(
        new Set(currentMapData.nodes.map(n => n.floorNumber))
      ).sort((a, b) => a - b)
    : [];

  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {currentMapData ? (
          <>
            <Map
              mapData={currentMapData}
              destination={firstExitNode ?? targetNode}
              current_node={currentBeacon}
              centerTrigger={centerTrigger}
              selectedFloor={selectedFloor}
              isSameMap={isSameMap}
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

            {/* Floor switcher */}
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
                <InfoBanner />
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
