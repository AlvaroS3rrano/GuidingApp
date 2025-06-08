import React, { useState, useEffect, useRef, useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { MapDataDTO } from '../classes/DTOs';
import { AppContext } from '../AppContext';
import { goToShowMap } from '../services/NavigationService';

const ClosestMapBanner: React.FC = () => {
  const { currentMapData } = useContext(AppContext);

  const [fallbackVisible, setFallbackVisible] = useState(false);

  // Timer for null-hide (2 minutes)
  const nullTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMapIdRef = useRef<number | null>(null);

  // Show alert for detected area
  const showClosestMapAlert = (mapData: MapDataDTO) => {
    Alert.alert(
      'Mapped area Detected',
      `Do you want to use the guiding mode for ${mapData.name}?`,
      [
        {
          text: 'Accept',
          onPress: () => {
            goToShowMap();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: false }
    );
  };

  // Start null-hide timer when mapData is cleared
  const startNullTimer = () => {
    if (nullTimeoutRef.current) clearTimeout(nullTimeoutRef.current);
    nullTimeoutRef.current = setTimeout(() => {
      setFallbackVisible(false);
      prevMapIdRef.current = null;
    }, 120000);
  };

  useEffect(() => {
    return () => {
      if (nullTimeoutRef.current) clearTimeout(nullTimeoutRef.current);
    };
  }, []);

  // Handle mapData changes
  useEffect(() => {
    if (currentMapData?.id != null) {
      // Clear null-hide if running
      if (nullTimeoutRef.current) {
        clearTimeout(nullTimeoutRef.current);
        nullTimeoutRef.current = null;
      }
      // If new map, show alert and icon
      if (prevMapIdRef.current !== currentMapData.id) {
        prevMapIdRef.current = currentMapData.id;
        setFallbackVisible(true);
        showClosestMapAlert(currentMapData);
      }
    } else {
      // MapData null: schedule hide after 2 min
      if (nullTimeoutRef.current) {
        clearTimeout(nullTimeoutRef.current);
      }
      startNullTimer();
    }
  }, [currentMapData]);

  const handleFallbackPress = () => {
    if (currentMapData && prevMapIdRef.current === currentMapData.id) {
      showClosestMapAlert(currentMapData);
    }
  };

  if (!fallbackVisible || !currentMapData) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.fallbackIcon} onPress={handleFallbackPress}>
      <Text style={styles.fallbackIconText}>ⓘ</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fallbackIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 999,
    backgroundColor: 'white',
    width: 40,
    padding: 5,
    borderRadius: 20,
    elevation: 5,
    opacity: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIconText: {
    fontSize: 24,
    color: '#333',
  },
});

export default ClosestMapBanner;
