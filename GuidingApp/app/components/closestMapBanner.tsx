import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { beaconEventEmitter } from '@/app/services/beaconScannerService';
import { useRouter } from 'expo-router';
import { MapDataDTO } from '../classes/DTOs';
import { globalBannerState } from './globalBannerState';

const ClosestMapBanner: React.FC = () => {
  // Al montar, reiniciamos el estado para que el popup se pueda volver a mostrar.
  useEffect(() => {
    setPopupShown(false);
    globalBannerState.popupShown = false;
  }, []);

  const [closestMap, setClosestMap] = useState<MapDataDTO | null>(globalBannerState.closestMap);
  const [popupShown, setPopupShown] = useState(globalBannerState.popupShown);
  const [fallbackVisible, setFallbackVisible] = useState(globalBannerState.fallbackVisible);

  // Creamos un ref para popupShown que se actualizará con el estado
  const popupShownRef = useRef(popupShown);
  useEffect(() => {
    popupShownRef.current = popupShown;
  }, [popupShown]);

  const router = useRouter();
  // Ref para almacenar el temporizador de 3 minutos.
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función que muestra la alerta (sólo se mostrará la primera vez)
  const showClosestMapAlert = (mapData: MapDataDTO) => {
    Alert.alert(
      "Mapped area Detected",
      `Do you want to use the guiding mode for ${mapData.name}?`,
      [
        {
          text: "Accept",
          onPress: () => {
            router.push({
              pathname: '/showMap',
              params: { mapData: JSON.stringify(mapData) }
            });
          },
        },
        {
          text: "Cancel",
          onPress: () => {
            setPopupShown(true);
            setFallbackVisible(true);
            globalBannerState.popupShown = true;
            globalBannerState.fallbackVisible = true;
          },
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  // Reinicia el temporizador de 3 minutos. Mientras se sigan emitiendo eventos,
  // se reiniciará y el banner se mantendrá.
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Si pasan 3 minutos sin reiniciarlo, se oculta el banner (y se limpia el estado global).
      setClosestMap(null);
      setFallbackVisible(false);
      setPopupShown(false);
      globalBannerState.closestMap = null;
      globalBannerState.fallbackVisible = false;
      globalBannerState.popupShown = false;
    }, 180000); // 180000 ms = 3 minutos
  };

  useEffect(() => {
    // Handler para cuando se detecta un nuevo mapData o se emite periódicamente.
    const closestHandler = (mapData: MapDataDTO) => {
      console.log(6)
      resetTimer();
      setClosestMap(mapData);
      globalBannerState.closestMap = mapData;
      // Consulta el valor actualizado usando el ref
      if (!popupShownRef.current) {
        showClosestMapAlert(mapData);
        setPopupShown(true);
        setFallbackVisible(true);
        globalBannerState.popupShown = true;
        globalBannerState.fallbackVisible = true;
      }
    };

    // Handler para el "heartbeat" periódico (nuevo evento con el mismo mapData).
    const newMapDataHandler = (newMapFlag: boolean) => {
      console.log(5)
      resetTimer();
    };

    beaconEventEmitter.on('closestMapData', closestHandler);
    beaconEventEmitter.on('newMapData', newMapDataHandler);

    return () => {
      beaconEventEmitter.off('closestMapData', closestHandler);
      beaconEventEmitter.off('newMapData', newMapDataHandler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // Ahora no depende de popupShown porque usamos el ref.

  // Al pulsar el ícono (fallback), se muestra la alerta nuevamente.
  const handleFallbackPress = () => {
    if (closestMap) {
      showClosestMapAlert(closestMap);
    }
  };

  return (
    <>
      {fallbackVisible && (
        <TouchableOpacity style={styles.fallbackIcon} onPress={handleFallbackPress}>
          <Text style={styles.fallbackIconText}>ⓘ</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fallbackIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'lightblue',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  fallbackIconText: {
    fontSize: 18,
    color: 'black',
  },
});

export default ClosestMapBanner;
