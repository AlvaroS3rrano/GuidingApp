import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, PanResponder, Alert } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  GestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Svg, { Rect, Polygon, Polyline, Circle, G, Image as SvgImage  } from 'react-native-svg';
import { Magnetometer } from 'expo-sensors';
import { Dot } from '../../classes/geometry';
import { getGraphPathByFloor, findFullPathOnFloor } from '@/app/services/pathFindingService';
import { getMatrixForFloor, MapDataDTO, NodeDTO, Path } from '../../classes/DTOs';
import { beaconEventEmitter } from '@/app/services/beaconScannerService';
import { MAP_COLORS } from '../../constants/colors';
import DestinationAlert from '../DestinationAlert';


type MapaInteriorProps = {
  mapData: MapDataDTO;
  destination: NodeDTO | null;
  current_node: NodeDTO | null;
  centerTrigger: number;
  selectedFloor?: number;
  isSameMap: boolean;
};

const { width, height } = Dimensions.get('window');

const MapaInterior: React.FC<MapaInteriorProps> = ({
  mapData,
  destination,
  current_node,
  centerTrigger,
  selectedFloor,
  isSameMap,
}) => {
  const [lastComment, setLastComment] = useState<string | null>(null);
  const [heading, setHeading] = useState(0);
  const map_adjustments = mapData.northAngle;

  // Set up the magnetometer to track device heading
  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(data => {
        const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        const correctedAngle = (angle - map_adjustments + 360) % 360;
        setHeading(correctedAngle);
    });
    return () => sub.remove();
  }, []);

  // Check if destination is reached
 const shouldShowAlert =
    current_node !== null &&
    destination && isSameMap &&
    current_node.x === destination.x &&
    current_node.y === destination.y;


  // Clone the initial map grid from the mapData prop
  const floor = typeof selectedFloor === 'number'
                ? selectedFloor
                : current_node?.floorNumber ?? 0;
  
  const startNode = React.useMemo(() => {
    if (current_node) return current_node;
    return null;
  }, [current_node]);

  const graphSequences = React.useMemo(() => {
    if (!startNode || !destination) return null;
    return getGraphPathByFloor(mapData, startNode, destination);
  }, [mapData, startNode, destination]);

  const seq = graphSequences?.find(s => s.floor === floor);
  let edgeComment: string | null = null;

  if (current_node && seq) {
    // Build an array of node IDs and find the index of the current node
    const ids = seq.nodes.map(n => n.node_id);
    const idx = ids.indexOf(current_node.id);
    const nextId = ids[idx + 1];

    if (nextId) {
      // Find the corresponding edge in your map data
      const edge = mapData.edges.find(e =>
        (e.fromNode.id === current_node.id && e.toNode.id === nextId)
        
      );
      edgeComment = edge?.comment ?? null; 
    }
  }

  useEffect(() => {
    setLastComment(edgeComment);
  }, [edgeComment]);

  useEffect(() => {
    if (lastComment) {
      beaconEventEmitter.emit("info", lastComment);
    } else {
      beaconEventEmitter.emit("updateInfo");
    }
  }, [lastComment]);
  
  const currentFloorWaypoints = React.useMemo<Dot[]>(
    () => {
      if (!graphSequences) return [];
      const seq = graphSequences.find(s => s.floor === floor);
      return seq?.nodes.map(w => w.dot) ?? [];
    },
    [graphSequences, floor]
  );
  
  const matrix = React.useMemo(
    () => getMatrixForFloor(mapData, floor),
    [mapData, floor]
  );
  
  const currentFloorPath = React.useMemo<Dot[]>(
    () => findFullPathOnFloor(matrix, currentFloorWaypoints) ?? [],
    [matrix, currentFloorWaypoints]
  );

  // Compute arrowAngle from that floor’s path
  const arrowAngle = React.useMemo(() => {
    if (currentFloorPath.length < 2) return 0;
    const [p,n] = [
      currentFloorPath[currentFloorPath.length - 1],
      currentFloorPath[currentFloorPath.length - 2]
    ];
    const dx = p.x - n.x, dy = p.y - n.y;
    return -Math.atan2(dy, dx) * 180/Math.PI + 90;
  }, [currentFloorPath]);

   // Determine floor matrix and dimensions

  const cellSize = width / matrix[0].length;
  const mapWidth = cellSize * matrix[0].length;
  const mapHeight = cellSize * matrix.length;
  const initialX = width / 2 - mapWidth / 2;
  const initialY = height / 2 - mapHeight / 2;

  // Pan & Pinch shared refs
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const panRef = useRef<any>();
  const pinchRef = useRef<any>();

  // Pan gesture
  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false }
  );
  const onPanStateChange = (event: GestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      pan.extractOffset();
    }
  };

  // Pinch gesture
  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: false }
  );
  const onPinchStateChange = (event: GestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const gestureScale = (event.nativeEvent as any).scale as number;
      lastScale.current *= gestureScale;
      baseScale.setValue(lastScale.current);
      scale.setValue(1);
    }
  };

  

  // Centering logic
  const centerMap = () => {
    pan.flattenOffset();
    let toX = initialX;
    let toY = initialY;
    if (current_node && current_node.floorNumber === floor) {
      const px = current_node.x * cellSize;
      const py = (matrix.length - 1 - current_node.y) * cellSize;
      toX = width / 2 - (px + cellSize / 2);
      toY = height / 2 - (py + cellSize / 2);
    }
    Animated.timing(pan, {
      toValue: { x: toX, y: toY },
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Optionally auto-center on centerTrigger
  useEffect(() => { centerMap(); }, [centerTrigger]);


  return (
    <View style={styles.container}>

      {shouldShowAlert && <DestinationAlert/>}
      
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanStateChange}
        simultaneousHandlers={pinchRef}
      >
        <PinchGestureHandler
          ref={pinchRef}
          onGestureEvent={onPinchEvent}
          onHandlerStateChange={onPinchStateChange}
          simultaneousHandlers={panRef}
        >
          <Animated.View
            style={{
              width: mapWidth,
              height: mapHeight,
              transform: [
                ...pan.getTranslateTransform(),
                { scale: Animated.multiply(baseScale, scale) },
              ],
            }}
          >
            <Svg width={mapWidth} height={mapHeight} style={styles.svg}>
              {/* Render the grid */}
              {matrix.map((row, y) =>
                row.map((cell, x) => (
                  <Rect
                    key={`${x}-${y}`}
                    x={x * cellSize}
                    y={y * cellSize}
                    width={cellSize}
                    height={cellSize}
                     fill={MAP_COLORS.grid[cell] ?? MAP_COLORS.grid[0]}
                  />
                ))
              )}
              {/* Render the computed path as a polyline if available */}
              {currentFloorPath.length > 1 && (
                <Polyline
                  points={currentFloorPath
                    .slice(0,-1)
                    .map(
                      p =>
                        `${p.x * cellSize + cellSize / 2},${(matrix.length - 1 - p.y) * cellSize + cellSize / 2}`
                    )
                    .join(' ')}
                  stroke={MAP_COLORS.path}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {/* Render the destination arrow */}
              {currentFloorPath.length > 1 && (() => {
                const end = currentFloorPath[currentFloorPath.length - 2];
                const cellX = end.x * cellSize;
                const cellY = (matrix.length - 1 - end.y) * cellSize;
                const cx = cellX + cellSize / 2;
                const cy = cellY + cellSize / 2;
                const size = cellSize * 0.5;  // tamaño de la flecha (ajusta si quieres)

                const points = `
                  ${cx},${cy - size}
                  ${cx - size},${cy + size}
                  ${cx + size},${cy + size}
                `.trim();

                return (
                  <Polygon
                    points={points}
                    fill={MAP_COLORS.path}
                     stroke={MAP_COLORS.path}
                    strokeWidth={1}
                    transform={`rotate(${arrowAngle}, ${cx}, ${cy})`}
                  />
                );
              })()}
      
              {/* Render the destination point if it exists */}
              {destination?.floorNumber === floor && (() => {
                const cx = destination.x * cellSize + cellSize / 2;
                const cy = (matrix.length - 1 - destination.y) * cellSize + cellSize / 2;
                const iconSize = cellSize*2; // o el tamaño que prefieras

                return (
                  <G>
                    {/* El círculo sigue aquí */}
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={cellSize / 3}
                      fill={MAP_COLORS.circle}
                      stroke={MAP_COLORS.darkStroke}
                      strokeWidth={2}
                    />
                    {/* Y la bandera encima */}
                    <SvgImage
                      x={cx - iconSize / 3}
                      y={cy - iconSize + 3}
                      width={iconSize}
                      height={iconSize}
                      href={require('../../../assets/images/race_flag.png')}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </G>
                );
              })()}
              {/* If a path exists, render the intermediate nodes */}
              {graphSequences && (
                graphSequences
                  .find(seq => seq.floor === floor)
                  ?.nodes
                  .filter((wp, idx, arr) => {
                    // Coordenadas actuales
                    const { x, y } = wp.dot;
                    // Comprueba si es el origen o el destino
                    const isOrigin = current_node && x === current_node.x && y === current_node.y;
                    const isDestination = destination && x === destination.x && y === destination.y;
                    // Si es el primero y coincide con el origen, lo quitamos
                    if (idx === 0 && isOrigin) return false;
                    // Si es el último y coincide con el destino, lo quitamos
                    if (idx === arr.length - 1 && isDestination) return false;
                    return true;
                  })
                  .map((wp, idx) => {
                    const { x, y } = wp.dot;
                    const cx = x * cellSize + cellSize / 2;
                    const cy = (matrix.length - 1 - y) * cellSize + cellSize / 2;
                    const radius = cellSize / 3;
                    return (
                      <Circle
                        key={`node-${floor}-${idx}`}
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill={MAP_COLORS.waypoint}
                      />
                    );
                  })
              )}
              {/* Render the user's sensor as a triangle if not in preview mode */}
              { current_node && current_node.floorNumber == floor && (() => {
                const sensorXPixel = current_node.x * cellSize;
                const sensorYPixel = (matrix.length - 1 - current_node.y) * cellSize;
                const sensorCenterX = sensorXPixel + cellSize / 2;
                const sensorCenterY = sensorYPixel + cellSize / 2;
                return (
                  <Polygon
                    points={`
                      ${sensorCenterX},${sensorYPixel}
                      ${sensorXPixel},${sensorYPixel + cellSize}
                      ${sensorXPixel + cellSize},${sensorYPixel + cellSize}
                    `}
                    fill={MAP_COLORS.userArrow}
                    stroke={MAP_COLORS.darkStroke}
                    strokeWidth="2"
                    transform={`rotate(${heading}, ${sensorCenterX}, ${sensorCenterY})`}
                  />
                );
              })()}
            </Svg>
          </Animated.View>
        </PinchGestureHandler>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  svg: {
    backgroundColor: '#fff',
  },
});

export default MapaInterior;
