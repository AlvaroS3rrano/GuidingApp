import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Map from './map';

// Corrección de la función flecha
const ShowMap: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Map />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShowMap;
