/**
 * Map.tsx
 *
 * This file defines the MapaInterior component, which renders the interactive map.
 *
 * Key functionalities:
 * - Renders a grid-based map using an SVG, where each cell’s color is determined by its type.
 * - Computes and displays the shortest path (as a polyline) between the origin and destination.
 * - Draws an arrow (polygon) at the destination.
 * - Displays the user's current sensor position as a triangle, rotated according to the device's heading.
 * - Enables smooth panning (dragging) of the map using touch gestures via Animated and PanResponder.
 * - When the Search button is pressed, animates the map so that the user's sensor (or origin sensor in preview mode)
 *   moves to the center of the screen.
 * - When Cancel is pressed, the map animates back to its original centered position.
 * - A center button (triggered by centerTrigger) re-centers the map accordingly.
 * - NEW: When the current sensor position reaches the destination (and in search mode, not preview),
 *   a prettier alert is shown with "Cancel" and "OK". If "OK" is pressed, it calls the cancel callback.
 *
 * Props:
 * - origin: Node selected as origin.
 * - destination: Node selected as destination.
 * - current_node: User's current sensor position from the beacon.
 * - searchPressed: Flag indicating that Search mode is active.
 * - centerTrigger: A number that increments when the center button is pressed.
 * - isPreview: Flag indicating preview mode.
 * - newTrip: The new trip path (if any).
 * - onCancelSearch: Callback to cancel the search (triggered when OK is pressed in the alert).
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, PanResponder, Alert } from 'react-native';
import Svg, { Rect, Polygon, Polyline, Circle } from 'react-native-svg';
import { Magnetometer } from 'expo-sensors';
import { Dot } from '../../classes/geometry';
import { getGraphPathByFloor, findFullPathOnFloor } from '@/app/services/pathFindingService';
import { getMatrixForFloor, MapDataDTO, NodeDTO, Path } from '../../classes/DTOs';


type MapaInteriorProps = {
  mapData: MapDataDTO;
  origin: NodeDTO | null;
  destination: NodeDTO | null;
  current_node: NodeDTO | null;
  searchPressed: boolean;
  centerTrigger: number;
  isPreview: boolean;
  onCancelSearch?: () => void;
  selectedFloor?: number;
};

const { width, height } = Dimensions.get('window');

const MapaInterior: React.FC<MapaInteriorProps> = ({
  mapData,
  origin,
  destination,
  current_node,
  searchPressed,
  centerTrigger,
  isPreview,
  onCancelSearch,
  selectedFloor,
}) => {
  const [heading, setHeading] = useState(0);
  const map_adjustments = 70;

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

  // Check if destination is reached and display a prettier alert with two options
  useEffect(() => {
    if (searchPressed && !isPreview && current_node && destination) {
      if (
        current_node.x === destination.x &&
        current_node.y === destination.y
      ) {
        Alert.alert(
          "Destination Reached",
          "You have arrived at your destination!",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => {
                if (onCancelSearch) onCancelSearch();
              },
            },
          ],
          { cancelable: true }
        );
      }
    }
  }, [current_node, destination, searchPressed, isPreview, onCancelSearch]);


  // Clone the initial map grid from the mapData prop
  const floor = typeof selectedFloor === 'number'
                ? selectedFloor
                : current_node?.floorNumber ?? origin?.floorNumber ?? 0;
  
  const anchorNode = React.useMemo(
    () =>
      searchPressed && !isPreview && current_node
        ? current_node
        : origin!,
    [searchPressed, isPreview, current_node, origin]
  );

  const graphSequences = React.useMemo(
    () => destination
      ? getGraphPathByFloor(mapData, anchorNode, destination)
      : null,
    [mapData, anchorNode, destination]
  );
  
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

  // Determine which sensor to use for centering
  const sensorForCenter = isPreview
    ? origin || null
    : current_node
      ? current_node
      : origin || null;

  // Calculate cell size based on the grid's width
  const cellSize = width / matrix[0].length;
  const mapWidth = cellSize * matrix[0].length;
  const mapHeight = cellSize * matrix.length;
  // Initially center the map on the screen
  const initialTranslateX = width / 2 - mapWidth / 2;
  const initialTranslateY = height / 2 - mapHeight / 2;

  // Set up animated values for panning the map
  const pan = useRef(new Animated.ValueXY({ x: initialTranslateX, y: initialTranslateY })).current;
  const panValue = useRef({ x: initialTranslateX, y: initialTranslateY });
  useEffect(() => {
    const id = pan.addListener((value) => {
      panValue.current = value;
    });
    return () => {
      pan.removeListener(id);
    };
  }, [pan]);

  // Configure PanResponder for touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Animate the map to center on the sensor when search is pressed or centerTrigger changes
  useEffect(() => {
    if (searchPressed) {
      // If we’re on the user’s floor, center on the user
      if (sensorForCenter && sensorForCenter.floorNumber === floor) {
        const xPix = sensorForCenter.x * cellSize;
        const yPix = (matrix.length - 1 - sensorForCenter.y) * cellSize;
        const centerX = xPix + cellSize / 2;
        const centerY = yPix + cellSize / 2;
        Animated.timing(pan, {
          toValue: { x: width / 2 - centerX, y: height / 2 - centerY },
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
          // Otherwise (floor without user), reset to the original pan
          Animated.timing(pan, {
            toValue: { x: initialTranslateX, y: initialTranslateY },
          duration: 300,
            useNativeDriver: false,
          }).start();
        }
      } else {
        // On canceling search, always reset to initial pan
        Animated.timing(pan, {
          toValue: { x: initialTranslateX, y: initialTranslateY },
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }, [
      searchPressed,
      centerTrigger,
      selectedFloor,        // re-run when you switch floors
      sensorForCenter,
      initialTranslateX,
      initialTranslateY,
      matrix.length,
      pan,
    ]);
  

  // Define color mapping for grid cells
  const colorMapping: Record<number, string> = {
    0: 'transparent',
    1: 'black',
    2: 'blue',
    3: 'red',
    4: 'orange'
  };

  return (
    <View style={styles.container}>
      {/* Animated.View handles panning and touch gestures */}
      <Animated.View
        style={{ transform: pan.getTranslateTransform() }}
        {...panResponder.panHandlers}
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
                fill={colorMapping[cell] || 'transparent'}
              />
            ))
          )}
          {/* Render the computed path as a polyline if available */}
          {currentFloorPath.length > 1 && (
            <Polyline
              points={currentFloorPath
                .map(
                  p =>
                    `${p.x * cellSize + cellSize / 2},${(matrix.length - 1 - p.y) * cellSize + cellSize / 2}`
                )
                .join(' ')}
              stroke="orange"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {/* Render the destination arrow */}
          {currentFloorPath.length > 1 && (
            <Polygon
              points={` 
                ${currentFloorPath[currentFloorPath.length - 1].x * cellSize + cellSize / 2},${(matrix.length - 1 - currentFloorPath[currentFloorPath.length - 1].y) * cellSize}
                ${currentFloorPath[currentFloorPath.length - 1].x * cellSize},${(matrix.length - 1 - currentFloorPath[currentFloorPath.length - 1].y) * cellSize + cellSize}
                ${currentFloorPath[currentFloorPath.length - 1].x * cellSize + cellSize},${(matrix.length - 1 - currentFloorPath[currentFloorPath.length - 1].y) * cellSize + cellSize}
              `}
              fill="orange"
              stroke="black"
              strokeWidth="1"
              transform={`rotate(${arrowAngle}, ${currentFloorPath[currentFloorPath.length - 1].x * cellSize + cellSize / 2}, ${(matrix.length - 1 - currentFloorPath[currentFloorPath.length - 1].y) * cellSize + cellSize / 2})`}
            />
          )}
          {/* Render the origin point if it exists */}
          {origin?.floorNumber === floor &&(
            <Circle
              cx={origin.x * cellSize + cellSize / 2}
              cy={(matrix.length - 1 - origin.y) * cellSize + cellSize / 2}
              r={cellSize / 3}
              fill="red" 
              stroke="black"
              strokeWidth={2}
            />
          )}
          {/* Render the destination point if it exists */}
          {destination?.floorNumber === floor && (
            <Circle
              cx={destination.x * cellSize + cellSize / 2}
              cy={(matrix.length - 1 - destination.y) * cellSize + cellSize / 2}
              r={cellSize / 3}
              fill="lightgreen"
              stroke="black"
              strokeWidth={2}
            />
          )}
          {/* If a path exists, render the intermediate nodes */}
          {graphSequences && (
            graphSequences
              .find(seq => seq.floor === floor)
              ?.nodes
              .filter((wp, idx, arr) => {
                // Coordenadas actuales
                const { x, y } = wp.dot;
                // Comprueba si es el origen o el destino
                const isOrigin = origin && x === origin.x && y === origin.y;
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
                    fill="royalblue"
                  />
                );
              })
          )}
          {/* Render the user's sensor as a triangle if not in preview mode */}
          {!isPreview && current_node && current_node.floorNumber == floor && (() => {
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
                fill="#00FF00"
                stroke="black"
                strokeWidth="2"
                transform={`rotate(${heading}, ${sensorCenterX}, ${sensorCenterY})`}
              />
            );
          })()}
        </Svg>
      </Animated.View>
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
