import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { generateGeom, updateMatrixWithDoors, Door } from '@/resources/geometry';


let plano = generateGeom([[0,0], [15,0], [15,5], [10,5], [10,10], [0,10]])

const doors: Door[] = [
  [[15, 2], [15, 3]], // Door from (15, 1) to (15, 4)
  [[10, 7], [10, 8]]  // Door from (10, 6) to (10, 9)
];

plano = updateMatrixWithDoors(plano, doors)

const { width } = Dimensions.get('window');
const margin = 20; // Margen deseado alrededor del mapa
const cellSize = (width - 2 * margin) / plano[0].length; // Ajustar el tamaño de las celdas considerando el margen
const strokeWidth = 2; // Grosor de las líneas que representan las paredes

const MapaInterior: React.FC = () => {

  return (
    <View style={styles.container}>
      <Svg
        width={width - 2 * margin}
        height={cellSize * plano.length}
        style={styles.svg}
      >
        {plano.map((fila, y) =>
          fila.map((celda, x) =>
            celda === 1 ? (
              <Rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black" // Color de las paredes
              />
            ) : null
          )
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