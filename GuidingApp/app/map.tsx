/**
 * IndoorMap Component
 * 
 * This component renders an interactive map of an indoor space using SVG.
 * It allows the visualization of walls, paths, doors, and a dynamically updating arrow 
 * that represents the user's current orientation based on magnetometer data.
 * 
 * Features:
 * - Displays a grid-based map with walls and paths.
 * - Uses Expo Magnetometer to determine and show the device's orientation.
 * - Draws an arrow at the origin that rotates based on the device's heading.
 * - Computes the shortest path between an origin and destination.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Polygon } from 'react-native-svg';
import { Magnetometer } from 'expo-sensors';
import { generateGeom, updateMatrixWithDoors, Door, Dot, transformRegion, updatePoint, updateMatrixWithPoints } from './classes/geometry';
import { findPathWithDistance } from '@/resources/sortestpath';

type MapaInteriorProps = {
  origin: Dot | null; // The starting point on the map
  destination: Dot | null; // The destination point on the map
};

// Define the initial geometry for the map
let plano: number[][] = generateGeom([
  { x: 0, y: 0 }, { x: 15, y: 0 }, { x: 15, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 10 }, { x: 0, y: 10 }
]);

// Define doors as connections between two points
const doors: Door[] = [
  [{ x: 15, y: 2 }, { x: 15, y: 3 }], // Door connecting (15,2) to (15,3)
  [{ x: 10, y: 7 }, { x: 10, y: 8 }], // Door connecting (10,7) to (10,8)
];

// Update the map with doors and transformed regions
plano = updateMatrixWithDoors(plano, doors);
transformRegion(plano, [
  { x: 10, y: 0 }, { x: 15, y: 0 }, { x: 15, y: 5 }, { x: 10, y: 5 }
], 2);

// Get device screen width to scale the map
const { width } = Dimensions.get('window');
const margin = 20; // Margin around the map
const cellSize = (width - 2 * margin) / plano[0].length; // Calculate cell size dynamically

// Define color mapping for different cell types
const colorMapping: Record<number, string> = {
  0: 'transparent', // Empty spaces
  1: 'black', // Walls
  2: 'blue', // Marked regions
  3: 'red', // Origin & destination
  4: 'orange' // Path
};

const MapaInterior: React.FC<MapaInteriorProps> = ({ origin, destination }) => {
  const [heading, setHeading] = useState(0); // Stores device heading angle

  const map_adjustments = 70; // Adjust to align 0° correctly

  useEffect(() => {
    const subscribe = async () => {
      Magnetometer.setUpdateInterval(100); // Update sensor data every 100ms
      Magnetometer.addListener(data => {
        const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        const correctedAngle = (angle - map_adjustments + 360) % 360; // Normalize to 0-360
        setHeading(correctedAngle);
      });
    };
    subscribe();
    return () => Magnetometer.removeAllListeners(); // Cleanup on unmount
  }, []);

  // Clone the initial map structure
  let updatedPlano: number[][] = JSON.parse(JSON.stringify(plano));
  let path: Dot[] = [];

  if (origin && destination) {
    updatePoint(updatedPlano, origin, 3); // Mark the origin
    updatePoint(updatedPlano, destination, 3); // Mark the destination
    path = findPathWithDistance(updatedPlano, origin, destination); // Compute shortest path
    updateMatrixWithPoints(updatedPlano, path, 4); // Update the map with the computed path
  }

  return (
    <View style={styles.container}>
      <Svg
        width={width - 2 * margin}
        height={cellSize * updatedPlano.length}
        style={styles.svg}
      >
        {updatedPlano.map((fila, y) =>
          fila.map((celda, x) => (
            <Rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={colorMapping[celda] || 'transparent'}
            />
          ))
        )}

        {origin && (
          <Polygon
            points={`
              ${origin.x * cellSize + cellSize / 2},${(plano.length - 1 - origin.y) * cellSize}
              ${origin.x * cellSize},${(plano.length - 1 - origin.y) * cellSize + cellSize}
              ${origin.x * cellSize + cellSize},${(plano.length - 1 - origin.y) * cellSize + cellSize}
            `}
            fill="#00FF00" // Bright green color
            stroke="black" // Black border
            strokeWidth="2"
            transform={`rotate(${heading}, ${origin.x * cellSize + cellSize / 2}, ${(plano.length - 1 - origin.y) * cellSize + cellSize / 2})`}
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: margin,
  },
  svg: {
    backgroundColor: '#fff',
  },
});

export default MapaInterior;
