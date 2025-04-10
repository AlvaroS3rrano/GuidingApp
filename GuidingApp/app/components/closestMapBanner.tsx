import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { beaconEventEmitter } from '@/app/services/beaconScannerService';
import { useRouter } from 'expo-router';
import { MapDataDTO } from '../classes/DTOs';

const ClosestMapBanner: React.FC = () => {
  const [closestMap, setClosestMap] = useState<MapDataDTO | null>(null);
  const [popupShown, setPopupShown] = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);

  const router = useRouter();

  // Ref para almacenar el temporizador de 3 minutos
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función que muestra la alerta (solo se muestra la primera vez)
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
              params: { mapData: JSON.stringify(mapData) },
            });
          },
        },
        {
          text: "Cancel",
          onPress: () => {
            setPopupShown(true);
            setFallbackVisible(true);
          },
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  // Función para reiniciar el timer
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Si pasan más de 3 minutos sin reiniciarlo, se oculta el banner
      setClosestMap(null);
      setFallbackVisible(false);
      setPopupShown(false);
    }, 180000); // 3 minutos en milisegundos
  };

  useEffect(() => {
    // Handler para cuando se detecta un nuevo mapData (nuevo beacon o beacon distinto)
    const closestHandler = (mapData: MapDataDTO) => {
      resetTimer();
      setClosestMap(mapData);
      // Si aún no se mostró la alerta, se muestra
      if (!popupShown) {
        showClosestMapAlert(mapData);
        setPopupShown(true);
        setFallbackVisible(true);
      }
    };

    // Handler para cuando se recibe "newMapData" (evento periódico que indica que el beacon se sigue detectando)
    const newMapDataHandler = (newMapFlag: boolean) => {
      // No mostramos la alerta de nuevo, solo reiniciamos el timer
      resetTimer();
    };

    beaconEventEmitter.on('closestMapData', closestHandler);
    beaconEventEmitter.on('newMapData', newMapDataHandler);

    return () => {
      beaconEventEmitter.off('closestMapData', closestHandler);
      beaconEventEmitter.off('newMapData', newMapDataHandler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [popupShown]);

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
