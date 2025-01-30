import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { generateGeom, updateMatrixWithDoors, Door, Dot, transformRegion, updatePoint, updateMatrixWithPoints } from '@/resources/geometry';
import { findPathWithDistance } from '@/resources/sortestpath';

type MapaInteriorProps = {
  origin: Dot | null;
  destination: Dot | null;
};

let plano: number[][] = generateGeom([[0, 0], [15, 0], [15, 5], [10, 5], [10, 10], [0, 10]]);

const doors: Door[] = [
  [[15, 2], [15, 3]], // Door from (15, 1) to (15, 4)
  [[10, 7], [10, 8]], // Door from (10, 6) to (10, 9)
];

plano = updateMatrixWithDoors(plano, doors);
transformRegion(plano, [[10,0],[15,0],[15,5],[10,5]], 2);

const { width } = Dimensions.get('window');
const margin = 20; // Margen deseado alrededor del mapa
const cellSize = (width - 2 * margin) / plano[0].length; // Ajustar el tamaño de las celdas considerando el margen

// Diccionario de colores
const colorMapping: Record<number, string> = {
  0: 'transparent', // Color para celdas vacías
  1: 'black',   // Color para paredes
  2: 'blue',    // Otro valor de ejemplo
  3: 'red',     // Otro valor de ejemplo
  4: 'orange'
};

const MapaInterior: React.FC<MapaInteriorProps> = ({ origin, destination }) => {
  let updatedPlano: number[][] = JSON.parse(JSON.stringify(plano));
  let path: Dot[] = [];

  if (origin && destination) {
    updatePoint(updatedPlano, origin, 3);
    updatePoint(updatedPlano, destination, 3);
    path = findPathWithDistance(updatedPlano, origin, destination);
    updateMatrixWithPoints(updatedPlano, path, 4);
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
              fill={colorMapping[celda] || 'transparent'} // Asignar color dinámicamente
            />
          ))
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
    margin: margin, // Aplicar margen alrededor del contenedor
  },
  svg: {
    backgroundColor: '#fff', // Color de fondo opcional para el SVG
  },
});

export default MapaInterior;
