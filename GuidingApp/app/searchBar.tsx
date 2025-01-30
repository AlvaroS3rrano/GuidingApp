import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

// Definimos los tipos de las props que recibe el componente
type SearchBarProps = {
  onSearch: (origin: string, destination: string) => void; // Función que recibe el origen y el destino como strings
};

// Definimos el componente funcional SearchBar con TypeScript
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  // Definimos los estados para almacenar el origen y el destino ingresados por el usuario
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Función que se ejecuta cuando el usuario presiona el botón "Buscar"
  const handleSearch = () => {
    if (onSearch) {
        onSearch(origin, destination); // Llamamos a la función onSearch pasando los valores ingresados
    }
  };

  return (
    <View style={styles.container}>
      {/* Campo de entrada para el origen */}
      <TextInput
        style={styles.input}
        placeholder="Ubicación de origen"
        value={origin}
        onChangeText={setOrigin} // Se actualiza el estado de origin cuando el usuario escribe
      />
      
      {/* Campo de entrada para el destino */}
      <TextInput
        style={styles.input}
        placeholder="Destino"
        value={destination}
        onChangeText={setDestination} // Se actualiza el estado de destination cuando el usuario escribe
      />
      
      {/* Botón que ejecuta la búsqueda al ser presionado */}
      <Button title="Buscar" onPress={handleSearch} />
    </View>
  );
};

// Estilos del componente
const styles = StyleSheet.create({
  container: {
    padding: 10,          // Espaciado interno
    backgroundColor: 'white',
    width: '100%',        // Ocupar todo el ancho disponible
  },
  input: {
    height: 40,          // Altura del campo de entrada
    borderColor: 'gray', // Color del borde
    borderWidth: 1,      // Grosor del borde
    marginBottom: 10,    // Espaciado entre los campos de entrada
    paddingHorizontal: 10, // Espaciado interno horizontal
    borderRadius: 5,     // Bordes redondeados
  },
});

// Exportamos el componente para que pueda ser usado en otros archivos
export default SearchBar;