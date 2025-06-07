import React, { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import { MapDataDTO, NodeDTO } from './classes/DTOs';
import { beaconEventEmitter } from './services/beaconScannerService';
import { MapDataService } from './services/mapDataService';

interface AppContextProps {
  targetNode: any;
  setTargetNode: (node: any) => void;
  targetMapData: any;
  setTargetMapData: (data: any) => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [targetNode, setTargetNode] = useState<any>(null);
  const [targetMapData, setTargetMapData] = useState<any>(null);
  const [currentBeacon, setCurrentBeacon] = useState<NodeDTO | null>(null);
  const [currentMapData, setCurrentMapData] = useState<MapDataDTO | null>(null);

  // Timeout refs: clear node after 4s, clear mapData after 3min
  const nodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Debounce candidate for stable beacon
  const candidateRef = useRef<{ node: NodeDTO; timer: NodeJS.Timeout } | null>(null);
  // Ref to always read latest currentMapData in handler
  const mapDataRef = useRef<MapDataDTO | null>(currentMapData);

  // Sync ref when mapData state changes
  useEffect(() => {
    mapDataRef.current = currentMapData;
  }, [currentMapData]);

  // Subscribe once to beacon events
  useEffect(() => {
    const handler = async (beaconId: string) => {
      // Reset node-clear timer
      if (nodeTimeoutRef.current) clearTimeout(nodeTimeoutRef.current);
      nodeTimeoutRef.current = setTimeout(() => {
        setCurrentBeacon(null);
      }, 4000);

      // Reset map-clear timer
      if (mapTimeoutRef.current) clearTimeout(mapTimeoutRef.current);
      mapTimeoutRef.current = setTimeout(() => {
        setCurrentMapData(null);
      }, 180000);

      try {
        // Determine if beacon belongs to existing mapData
        let mapDto = mapDataRef.current;
        let nodeDto: NodeDTO | null = null;

        if (mapDto && mapDto.nodes.some(n => n.beaconId === beaconId)) {
          nodeDto = mapDto.nodes.find(n => n.beaconId === beaconId)!;
        } else {
          const fetchedMap = await MapDataService.getMapDataByNodeId(beaconId);
          const fetchedNode = fetchedMap.nodes.find(n => n.beaconId === beaconId) || null;
          if (!fetchedNode) {
            // invalid beacon: clear debounce
            if (candidateRef.current?.timer) clearTimeout(candidateRef.current.timer);
            candidateRef.current = null;
            return;
          }
          mapDto = fetchedMap;
          nodeDto = fetchedNode;
        }

        if (nodeDto) {
          // Debounce: require stable for 1s
          if (!candidateRef.current || candidateRef.current.node.id !== nodeDto.id) {
            if (candidateRef.current?.timer) clearTimeout(candidateRef.current.timer);
            candidateRef.current = {
              node: nodeDto,
              timer: setTimeout(() => {
                setCurrentBeacon(nodeDto);
                setCurrentMapData(mapDto!);
                candidateRef.current = null;
              }, 1000),
            };
          }
        }
      } catch (error) {
        console.error('Error handling beacon event:', error);
        if (candidateRef.current?.timer) clearTimeout(candidateRef.current.timer);
        candidateRef.current = null;
        setCurrentBeacon(null);
        setCurrentMapData(null);
      }
    };

    beaconEventEmitter.on('closestBeacon', handler);
    return () => {
      beaconEventEmitter.off('closestBeacon', handler);
      if (nodeTimeoutRef.current) clearTimeout(nodeTimeoutRef.current);
      if (mapTimeoutRef.current) clearTimeout(mapTimeoutRef.current);
      if (candidateRef.current?.timer) clearTimeout(candidateRef.current.timer);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        targetNode,
        setTargetNode,
        targetMapData,
        setTargetMapData,
        currentBeacon,
        currentMapData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
