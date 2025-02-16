/**
 * IndoorMap Component
 * 
 * This component renders an interactive indoor map using SVG.
 * It displays walls, paths, and doors, and shows a dynamically rotating arrow
 * representing the user's current orientation based on magnetometer data.
 * 
 * Features:
 * - Renders a grid-based map with walls and marked regions.
 * - Computes the shortest path between an origin and a destination.
 * - Displays a directional arrow:
 *    - The destination arrow is computed based on the path.
 *    - The user direction arrow is drawn at the sensor coordinates of the current node,
 *      if provided; otherwise, it falls back to the origin sensor.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Polygon, Polyline } from 'react-native-svg';
import { Magnetometer } from 'expo-sensors';
import { generateGeom, updateMatrixWithDoors, Door, Dot, transformRegion, updatePoint, updateMatrixWithPoints } from './classes/geometry';
import { findPathWithDistance } from '@/resources/sortestpath';
import { Node } from '@/app/classes/node';

type MapaInteriorProps = {
  origin: Node | null;         // The starting point on the map.
  destination: Node | null;    // The destination point on the map.
  current_node: Node | null;   // The current node, used for the user direction arrow.
};

// Define the initial geometry for the map.
let plano: number[][] = generateGeom([
  { x: 0, y: 0 }, { x: 15, y: 0 }, { x: 15, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 10 }, { x: 0, y: 10 }
]);

// Define doors as connections between two points.
const doors: Door[] = [
  [{ x: 15, y: 2 }, { x: 15, y: 3 }], // Door connecting (15,2) to (15,3)
  [{ x: 10, y: 7 }, { x: 10, y: 8 }], // Door connecting (10,7) to (10,8)
];

// Update the map with doors and transformed regions.
plano = updateMatrixWithDoors(plano, doors);
transformRegion(plano, [
  { x: 10, y: 0 }, { x: 15, y: 0 }, { x: 15, y: 5 }, { x: 10, y: 5 }
], 2);

// Get device screen width to scale the map.
const { width } = Dimensions.get('window');
const margin = 20; // Margin around the map.
const cellSize = (width - 2 * margin) / plano[0].length; // Calculate cell size dynamically.

// Define color mapping for different cell types.
const colorMapping: Record<number, string> = {
  0: 'transparent', // Empty spaces.
  1: 'black',       // Walls.
  2: 'blue',        // Marked regions.
  3: 'red',         // Origin & destination.
  4: 'orange'       // Path.
};

const MapaInterior: React.FC<MapaInteriorProps> = ({ origin, destination, current_node }) => {
  const [heading, setHeading] = useState(0); // Stores the device heading angle.
  const map_adjustments = 70; // Adjustment to align 0° correctly.

  useEffect(() => {
    const subscribe = async () => {
      Magnetometer.setUpdateInterval(100); // Update sensor data every 100ms.
      Magnetometer.addListener(data => {
        const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        const correctedAngle = (angle - map_adjustments + 360) % 360; // Normalize to 0-360.
        setHeading(correctedAngle);
      });
    };
    subscribe();
    return () => Magnetometer.removeAllListeners(); // Cleanup on unmount.
  }, []);

  // Clone the initial map structure.
  let updatedPlano: number[][] = JSON.parse(JSON.stringify(plano));
  let path: Dot[] = [];
  let arrowAngle = 0;

  // Determine the sensor coordinates for origin and destination.
  const originSensor = origin ? origin.sensor : null;
  const destinationSensor = destination ? destination.sensor : null;

  // Compute the shortest path if both origin and destination are available.
  if (originSensor && destinationSensor) {
    // Mark the origin and destination on the map.
    updatePoint(updatedPlano, originSensor, 3); // Mark origin.
    updatePoint(updatedPlano, destinationSensor, 3); // Mark destination.

    // Compute the shortest path between origin and destination.
    path = findPathWithDistance(updatedPlano, originSensor, destinationSensor);

    // Calculate the destination arrow angle if the path has more than one point.
    if (path.length > 1) {
      const lastPoint = path[path.length - 1]; // Destination point.
      const secondLastPoint = path[path.length - 2]; // Point before destination.

      // Calculate differences in x and y coordinates.
      const dx = lastPoint.x - secondLastPoint.x;
      const dy = lastPoint.y - secondLastPoint.y;

      // Compute the arrow angle in degrees.
      arrowAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      // Adjust the angle to match the SVG coordinate system.
      arrowAngle = -arrowAngle + 90;
    }
  }

  // Determine which sensor to use for the user direction arrow:
  // Use current_node's sensor if provided; otherwise, fallback to originSensor.
  const userSensor = current_node ? current_node.sensor : originSensor;

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

        {/* Render the computed path as a thin polyline */}
        {path.length > 1 && (
          <Polyline
            points={path
              .map(
                p =>
                  `${p.x * cellSize + cellSize / 2},${(plano.length - 1 - p.y) * cellSize + cellSize / 2}`
              )
              .join(' ')}
            stroke="orange"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Render the destination arrow based on the computed path */}
        {path.length > 1 && (
          <Polygon
            points={`
              ${path[path.length - 1].x * cellSize + cellSize / 2},${(plano.length - 1 - path[path.length - 1].y) * cellSize}
              ${path[path.length - 1].x * cellSize},${(plano.length - 1 - path[path.length - 1].y) * cellSize + cellSize}
              ${path[path.length - 1].x * cellSize + cellSize},${(plano.length - 1 - path[path.length - 1].y) * cellSize + cellSize}
            `}
            fill="orange"
            stroke="black"
            strokeWidth="1"
            transform={`rotate(${arrowAngle}, ${path[path.length - 1].x * cellSize + cellSize / 2}, ${
              (plano.length - 1 - path[path.length - 1].y) * cellSize + cellSize / 2
            })`}
          />
        )}

        {/* Render the user direction arrow at the current node's sensor (or originSensor if current_node is not provided) */}
        {userSensor &&
          (() => {
            // Calculate the top-left coordinates of the sensor cell.
            const sensorX = userSensor.x * cellSize;
            // Invert the y-coordinate for the SVG coordinate system.
            const sensorY = (plano.length - 1 - userSensor.y) * cellSize;
            // Compute the center of the sensor cell.
            const sensorCenterX = sensorX + cellSize / 2;
            const sensorCenterY = sensorY + cellSize / 2;

            return (
              <Polygon
                // Define a triangle for the user direction arrow.
                points={`
                  ${sensorCenterX},${sensorY}
                  ${sensorX},${sensorY + cellSize}
                  ${sensorX + cellSize},${sensorY + cellSize}
                `}
                fill="#00FF00" // Bright green color.
                stroke="black" // Black border for visibility.
                strokeWidth="2"
                // Rotate the arrow based on the device's heading.
                transform={`rotate(${heading}, ${sensorCenterX}, ${sensorCenterY})`}
              />
            );
          })()}
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
