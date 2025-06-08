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
import { goToGlobalMap } from '../services/NavigationService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

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
  const [isSameMap, setIsSameMap] = useState<boolean>(true);

  console.log(currentMapData?.id)
  console.log(targetMapData?.id)

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
  if (!currentMapData || !targetMapData) {
    setIsSameMap(true);
    setFirstExitNode(null);
    return;
  }
  // si cambiamos de mapa
  if (currentMapData.id !== targetMapData.id) {
    setIsSameMap(false)
    NodeService
      .getExitNodesByMapDataId(currentMapData.id)
      .then(nodes => setFirstExitNode(nodes[0] ?? null))
      .catch(() => setFirstExitNode(null));
  } else {
    setIsSameMap(true);
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
        {/* Header Bar: always visible */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goToGlobalMap()}
          >
            <FontAwesome5 name="map-marked-alt" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentMapData?.name ?? 'Indoor Map'}
          </Text>
        </View>
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
   container: { flex: 1 },
  header: {
    height: 56,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-start',  
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    zIndex: 10,
  },
  backButton: {
    paddingRight: 12,
    position: 'absolute',
    left: 20,
    zIndex: 11,
  },
  headerTitle: {
    flex: 1,                     
    textAlign: 'center',         
    fontSize: 18,
    fontWeight: '600',
  },
  searchWrapper: {
    position: 'absolute',
    top: 56 + 10,
    left: 10,
    right: 10,
    zIndex: 10,
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
    zIndex: 10,
  },
  floorSwitcher: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrow: { fontSize: 32, marginHorizontal: 20, opacity: 0.8 },
  floorLabel: { fontSize: 18, fontWeight: 'bold' },
  noMapText: { flex: 1, textAlign: 'center', marginTop: 50 },
});

export default ShowMapScreen;
