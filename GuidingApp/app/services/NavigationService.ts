import React, { useContext, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { AppContext } from '../AppContext';

export function goToGlobalMap() {
  router.replace('/screens/globalMapScreen');
}

export function goToShowMap() {
  router.replace({
    pathname: '/screens/showMapScreen',
  });
}

/**
 * NavigationController component:
 * - On app load, if a beacon is detected, navigates to ShowMapScreen
 * - Otherwise, ensures GlobalMapScreen is shown
 */
export const NavigationController: React.FC = () => {
  const { currentBeacon, currentMapData } = useContext(AppContext);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!hasNavigated.current) {
      if (currentBeacon && currentMapData) {
        goToShowMap();
        hasNavigated.current = true;
      } else if (!currentBeacon) {
        goToGlobalMap();
        hasNavigated.current = true;
      }
    }
  }, [currentBeacon, currentMapData]);

  return null;
};
