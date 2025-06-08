import React, {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { MapDataDTO, NodeDTO } from './classes/DTOs';
import { beaconEventEmitter } from './services/beaconScannerService';
import { MapDataService } from './services/mapDataService';

interface AppContextProps {
  targetNode: NodeDTO | null;
  setTargetNode: (node: NodeDTO | null) => void;
  targetMapData: MapDataDTO | null;
  setTargetMapData: (data: MapDataDTO | null) => void;
  currentBeacon: NodeDTO | null;
  currentMapData: MapDataDTO | null;
}

export const AppContext = createContext<AppContextProps>({
  targetNode: null,
  setTargetNode: () => {},
  targetMapData: null,
  setTargetMapData: () => {},
  currentBeacon: null,
  currentMapData: null,
});

const BEACON_DEBOUNCE_MS = 300;

export function AppProvider({ children }: { children: ReactNode }) {
  const [targetNode, setTargetNode] = useState<NodeDTO | null>(null);
  const [targetMapData, setTargetMapData] = useState<MapDataDTO | null>(null);
  const [currentBeacon, setCurrentBeacon] = useState<NodeDTO | null>(null);
  const [currentMapData, setCurrentMapData] = useState<MapDataDTO | null>(null);

  // Ref to keep the latest mapData
  const mapDataRef = useRef<MapDataDTO | null>(null);
  const nodeRef = useRef<NodeDTO | null>(null);
  const nodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingBeaconRef = useRef<string | null>(null);
  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mapDataRef.current = currentMapData;
  }, [currentMapData]);

  useEffect(() => {
    nodeRef.current = currentBeacon;
  }, [currentBeacon]);

  // Handle raw beacon events: schedule confirmation after 500ms of inactivity
  const processBeacon = useCallback(async (beaconId: string) => {
    if (mapTimeoutRef.current) clearTimeout(mapTimeoutRef.current);

    if (nodeRef.current?.beaconId === beaconId) {
      if (nodeTimeoutRef.current) clearTimeout(nodeTimeoutRef.current);
      return;
    }

    // 2) Si dentro del mapa actual ya existe el nodo, solo actualizar currentBeacon
    const existingNode = mapDataRef.current?.nodes.find(n => n.beaconId === beaconId) || null;
    if (existingNode) {
      setCurrentBeacon(existingNode);
      if (nodeTimeoutRef.current) clearTimeout(nodeTimeoutRef.current);
      return;
    }

    try {
      const mapDto = await MapDataService.getMapDataByNodeId(beaconId);
      const nodeDto = mapDto.nodes.find(n => n.beaconId === beaconId) || null;
      if (nodeDto) {
        setCurrentMapData(mapDto);
        setCurrentBeacon(nodeDto);
        nodeTimeoutRef.current = setTimeout(() => {
          setCurrentBeacon(null);
          nodeRef.current = null;
        }, 4000)
        mapTimeoutRef.current = setTimeout(() => {
          setCurrentMapData(null);
          mapDataRef.current = null;
        }, 120000);
      } else {
        setCurrentMapData(null);
        setCurrentBeacon(null);
      }
    } catch (err) {
      console.error('Error al procesar beacon:', err);
      setCurrentMapData(null);
      setCurrentBeacon(null);
    }
  }, []);

  const handleBeacon = useCallback((beaconId: string) => {
    // Cancel any pending switch
    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);

    // Schedule process if stable after debounce
    pendingBeaconRef.current = beaconId;
    pendingTimeoutRef.current = setTimeout(() => {
      if (pendingBeaconRef.current) {
        processBeacon(pendingBeaconRef.current);
        pendingBeaconRef.current = null;
      }
    }, BEACON_DEBOUNCE_MS);
  }, [processBeacon]);

  // Subscribe to beacon events once
  useEffect(() => {
    beaconEventEmitter.on('closestBeacon', handleBeacon);
    return () => {
      beaconEventEmitter.off('closestBeacon', handleBeacon);
    };
  }, [handleBeacon]);


  const contextValue = useMemo(
    () => ({
      targetNode,
      setTargetNode,
      targetMapData,
      setTargetMapData,
      currentBeacon,
      currentMapData,
    }),
    [targetNode, targetMapData, currentBeacon, currentMapData]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
