import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Map from './map';
import SearchBar from './searchBar';
import { Dot } from '@/resources/geometry';

// Diccionario de ubicaciones predefinidas, donde cada clave (string) tiene un valor de tipo Dot (coordenadas)
const places: Record<string, Dot> = {
  'Or': [13, 2], // Coordenadas para "origen"
  'Des': [3, 8], // Coordenadas para "destino"
};

// Componente principal que gestiona la búsqueda y la visualización del mapa
const ShowMap: React.FC = () => {
  // Estados para almacenar el origen y el destino ingresados por el usuario
  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);

  // Función que se ejecuta cuando el usuario presiona "Buscar" en SearchBar
  const handleSearch = (origin: string, destination: string) => {
    if (places[origin] && places[destination]) {
      setOrigin(origin);
      setDestination(destination);
    } else {
      console.warn("Ubicación no encontrada en el diccionario.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Componente de búsqueda donde el usuario introduce el origen y el destino */}
      <SearchBar onSearch={handleSearch} />

      {/* Mapa que recibe las coordenadas correspondientes al origen y destino ingresados */}
      <Map 
        origin={origin ? places[origin] : null} 
        destination={destination ? places[destination] : null} 
      />
    </SafeAreaView>
  );
};

// 🔹 Estilos del contenedor principal
const styles = StyleSheet.create({
  container: {
    flex: 1,                // Ocupa toda la pantalla
    backgroundColor: '#fff', // Fondo blanco
    justifyContent: 'center', // Centrar los elementos en la pantalla
    alignItems: 'center',   // Alinear al centro horizontalmente
  },
});

// 🔹 Exportamos el componente para poder usarlo en otros archivos
export default ShowMap;