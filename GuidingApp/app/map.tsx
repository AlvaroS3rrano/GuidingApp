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
 * - When the Search button is pressed, animates the map so that the user's position triangle moves to the center
 *   of the screen.
 *
 * Usage:
 * - Receives props for origin, destination, and current_node (user's sensor position).
 * - The 'searchPressed' flag triggers the pan animation to center the user's sensor.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import Svg, { Rect, Polygon, Polyline } from 'react-native-svg';
import { Magnetometer } from 'expo-sensors';
import { generateGeom, updateMatrixWithDoors, Door, Dot, transformRegion, updatePoint } from './classes/geometry';
import { findPathWithDistance } from '@/resources/sortestpath';
import { Node } from '@/app/classes/node';

type MapaInteriorProps = {
  origin: Node | null;
  destination: Node | null;
  current_node: Node | null; // user's sensor position
  searchPressed: boolean;
};

let plano: number[][] = generateGeom([
  { x: 0, y: 0 },
  { x: 15, y: 0 },
  { x: 15, y: 5 },
  { x: 10, y: 5 },
  { x: 10, y: 10 },
  { x: 0, y: 10 }
]);
const doors: Door[] = [
  [{ x: 15, y: 2 }, { x: 15, y: 3 }],
  [{ x: 10, y: 7 }, { x: 10, y: 8 }],
];
plano = updateMatrixWithDoors(plano, doors);

const { width, height } = Dimensions.get('window');
// Set cellSize so the map fills the screen width
const cellSize = width / plano[0].length;

// Define color mapping for each cell type
const colorMapping: Record<number, string> = {
  0: 'transparent',
  1: 'black',
  2: 'blue',
  3: 'red',
  4: 'orange'
};

const MapaInterior: React.FC<MapaInteriorProps> = ({
  origin,
  destination,
  current_node,
  searchPressed,
}) => {
  const [heading, setHeading] = useState(0);
  const map_adjustments = 70;

  // Set up the magnetometer for device heading
  useEffect(() => {
    const subscribe = async () => {
      Magnetometer.setUpdateInterval(100);
      Magnetometer.addListener(data => {
        const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        const correctedAngle = (angle - map_adjustments + 360) % 360;
        setHeading(correctedAngle);
      });
    };
    subscribe();
    return () => Magnetometer.removeAllListeners();
  }, []);

  // Clone the base map structure for further modifications
  let updatedPlano: number[][] = JSON.parse(JSON.stringify(plano));
  let path: Dot[] = [];
  let arrowAngle = 0;

  const originSensor = origin ? origin.sensor : null;
  const destinationSensor = destination ? destination.sensor : null;

  if (originSensor && destinationSensor) {
    updatePoint(updatedPlano, originSensor, 3); // Mark the origin cell
    updatePoint(updatedPlano, destinationSensor, 3); // Mark the destination cell
    path = findPathWithDistance(updatedPlano, originSensor, destinationSensor);
    if (path.length > 1) {
      const lastPoint = path[path.length - 1];
      const secondLastPoint = path[path.length - 2];
      const dx = lastPoint.x - secondLastPoint.x;
      const dy = lastPoint.y - secondLastPoint.y;
      arrowAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      arrowAngle = -arrowAngle + 90;
    }
  }

  // Use current_node if available; otherwise, fallback to originSensor
  const userSensor = current_node ? current_node.sensor : originSensor;

  if (current_node && origin && origin.area) {
    transformRegion(updatedPlano, origin.area, 2);
  }

  // Calculate map dimensions
  const mapWidth = cellSize * updatedPlano[0].length;
  const mapHeight = cellSize * updatedPlano.length;
  // Initially center the map so the whole map is centered on the screen
  const initialTranslateX = width / 2 - mapWidth / 2;
  const initialTranslateY = height / 2 - mapHeight / 2;

  // Set up Animated.ValueXY for panning
  const pan = useRef(new Animated.ValueXY({ x: initialTranslateX, y: initialTranslateY })).current;
  // Save the current pan values in a ref for later reference
  const panValue = useRef({ x: initialTranslateX, y: initialTranslateY });
  useEffect(() => {
    const id = pan.addListener((value) => {
      panValue.current = value;
    });
    return () => {
      pan.removeListener(id);
    };
  }, [pan]);

  // Configure PanResponder to allow dragging the map with touch gestures
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

  // When search is pressed, animate the map so that the user's sensor (triangle) moves to the center of the screen.
  useEffect(() => {
    if (searchPressed && userSensor) {
      // Calculate the sensor's pixel position on the map
      const sensorXPixel = userSensor.x * cellSize;
      const sensorYPixel = (updatedPlano.length - 1 - userSensor.y) * cellSize;
      const sensorCenterX = sensorXPixel + cellSize / 2;
      const sensorCenterY = sensorYPixel + cellSize / 2;
      // Compute new pan values so that the sensor center is at the center of the screen
      const newPanX = width / 2 - sensorCenterX;
      const newPanY = height / 2 - sensorCenterY;
      Animated.timing(pan, {
        toValue: { x: newPanX, y: newPanY },
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [searchPressed, userSensor, updatedPlano.length, pan]);

  return (
    <View style={styles.container}>
      {/* Animated.View handles panning and moving of the map */}
      <Animated.View 
        style={{ transform: pan.getTranslateTransform() }} 
        {...panResponder.panHandlers}
      >
        {/* Svg renders the entire map as a grid */}
        <Svg width={mapWidth} height={mapHeight} style={styles.svg}>
          {/* Render the map grid: each Rect represents a cell */}
          {updatedPlano.map((row, y) =>
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
          {/* Render the computed path (if exists) as a polyline */}
          {path.length > 1 && (
            <Polyline
              points={path
                .map(
                  p =>
                    `${p.x * cellSize + cellSize / 2},${(updatedPlano.length - 1 - p.y) * cellSize + cellSize / 2}`
                )
                .join(' ')}
              stroke="orange"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {/* Render the destination arrow as a polygon */}
          {path.length > 1 && (
            <Polygon
              points={`
                ${path[path.length - 1].x * cellSize + cellSize / 2},${(updatedPlano.length - 1 - path[path.length - 1].y) * cellSize}
                ${path[path.length - 1].x * cellSize},${(updatedPlano.length - 1 - path[path.length - 1].y) * cellSize + cellSize}
                ${path[path.length - 1].x * cellSize + cellSize},${(updatedPlano.length - 1 - path[path.length - 1].y) * cellSize + cellSize}
              `}
              fill="orange"
              stroke="black"
              strokeWidth="1"
              transform={`rotate(${arrowAngle}, ${path[path.length - 1].x * cellSize + cellSize / 2}, ${
                (updatedPlano.length - 1 - path[path.length - 1].y) * cellSize + cellSize / 2
              })`}
            />
          )}
          {/* Render the user's sensor as a triangle (Polygon) */}
          {userSensor &&
            (() => {
              const sensorXPixel = userSensor.x * cellSize;
              const sensorYPixel = (updatedPlano.length - 1 - userSensor.y) * cellSize;
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
    backgroundColor: '#fff', // White background for areas without map content
  },
  svg: {
    backgroundColor: '#fff',
  },
});

export default MapaInterior;
