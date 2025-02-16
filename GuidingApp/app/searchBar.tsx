/**
 * SearchBar.tsx
 * 
 * This component provides a user interface for entering the origin and destination locations.
 * It is a controlled component that receives the current values and update functions from its parent.
 * 
 * Props:
 * - origin: The current origin value.
 * - destination: The current destination value.
 * - onOriginChange: Callback to update the origin value.
 * - onDestinationChange: Callback to update the destination value.
 * - onSearch: Callback executed when the user initiates a search.
 */

import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

type SearchBarProps = {
  origin: string;
  destination: string;
  onOriginChange: (text: string) => void;
  onDestinationChange: (text: string) => void;
  onSearch: () => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSearch,
}) => {
  return (
    <View style={styles.container}>
      {/* Input field for the origin location */}
      <TextInput
        style={styles.input}
        placeholder="Origin Location"
        value={origin}
        onChangeText={onOriginChange}
      />
      
      {/* Input field for the destination location */}
      <TextInput
        style={styles.input}
        placeholder="Destination"
        value={destination}
        onChangeText={onDestinationChange}
      />
      
      {/* Button to trigger the search action */}
      <Button title="Search" onPress={onSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'white',
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default SearchBar;
