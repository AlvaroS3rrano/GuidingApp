import React, { useState, useEffect, useRef, useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { MapDataDTO } from '../classes/DTOs';
import { AppContext } from '../AppContext';
import { goToShowMap } from '../services/NavigationService';
import { usePathname } from 'expo-router';

const ClosestMapBanner: React.FC = () => {
  const pathname = usePathname();
  const { targetNode, targetMapData, currentMapData } = useContext(AppContext);

  const [canShowBanner, setCanShowBanner] = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const nullTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMapIdRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setCanShowBanner(true), 60000);
    return () => clearTimeout(timer);
  }, []);

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

    if (targetNode  || targetMapData) {
      setFallbackVisible(false);
      return;
    }

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
         if (canShowBanner && !pathname.includes('showMapScreen')) {
          showClosestMapAlert(currentMapData);
        }
      }
    } else {
      // MapData null: schedule hide after 2 min
      if (nullTimeoutRef.current) {
        clearTimeout(nullTimeoutRef.current);
      }
      startNullTimer();
    }
  }, [currentMapData, pathname, canShowBanner, targetNode, targetMapData]);

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
