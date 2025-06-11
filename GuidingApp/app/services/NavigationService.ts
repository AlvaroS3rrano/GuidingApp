import React, { useContext, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { AppContext } from '../AppContext';

export function goToGlobalMap() {
  router.replace('/screens/globalMapScreen');
}

export function goToShowMap() {
  router.replace({ pathname: '/screens/showMapScreen' });
}

/**
 * NavigationController:
 * Initially shows global map, then if a beacon and map data
 * arrive within the first minute, redirects to the showMap screen.
 */
export const NavigationController: React.FC = () => {
  const { currentBeacon, currentMapData } = useContext(AppContext);
  const hasNavigated = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: default to global map and start 1-minute window
  useEffect(() => {
    goToGlobalMap();
    timerRef.current = setTimeout(() => {
      // Disable further navigation after 1 minute
      hasNavigated.current = true;
    }, 60_000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Within the first minute, navigate to showMap if beacon+data appear
  useEffect(() => {
    if (hasNavigated.current) return;
    if (currentBeacon && currentMapData) {
      goToShowMap();
      hasNavigated.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [currentBeacon, currentMapData]);

  return null;
};
