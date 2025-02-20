/**
 * SearchBar.tsx
 *
 * This file defines the SearchBar component, which provides the user interface for entering origin and destination.
 *
 * Key functionalities:
 * - Provides controlled input fields for origin and destination.
 * - Displays a recommended origin suggestion (e.g., based on the user's sensor data) below the origin input
 *   when it is focused and empty.
 * - Includes clear buttons ("X") next to each input to allow quick clearing of the fields.
 * - Disables the Search button (and renders it in gray) until both origin and destination inputs are filled.
 *
 * Usage:
 * - The SearchBar component is used within ShowMap to capture user input for map navigation.
 * - It passes updated values back to the parent via onOriginChange, onDestinationChange, and onSearch callbacks.
 */

import React, { useState }  from 'react';
import { View, TextInput, Button, StyleSheet, Pressable, Text } from 'react-native';

type SearchBarProps = {
  origin: string;
  destination: string;
  recommendedOrigin?: string; // Recommended origin suggestion (current node)
  onOriginChange: (text: string) => void;
  onDestinationChange: (text: string) => void;
  onSearch: () => void;
};

// ClearButton component without hover effect
const ClearButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.clearButton}>
      <Text style={styles.clearButtonText}>X</Text>
    </Pressable>
  );
};

const SearchBar: React.FC<SearchBarProps> = ({
  origin,
  destination,
  recommendedOrigin,
  onOriginChange,
  onDestinationChange,
  onSearch,
}) => {
  // State to control the visibility of suggestions for the origin input
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Determine if search button should be enabled (both origin and destination provided)
  const isSearchEnabled = origin.trim().length > 0 && destination.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Origin input container with clear button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Origin Location"
          value={origin}
          onChangeText={onOriginChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow tap events to register
            setTimeout(() => setShowSuggestions(false), 100);
          }}
        />
        {origin ? (
          <ClearButton onPress={() => onOriginChange('')} />
        ) : null}
      </View>
      {/* Show suggestion below origin input only if the field is empty */}
      {showSuggestions && recommendedOrigin && !origin ? (
        <Pressable
          style={styles.suggestion}
          onPress={() => {
            onOriginChange(recommendedOrigin);
            setShowSuggestions(false);
          }}
        >
          <Text style={styles.suggestionText}>{recommendedOrigin}</Text>
        </Pressable>
      ) : null}
      
      {/* Destination input container with clear button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Destination"
          value={destination}
          onChangeText={onDestinationChange}
        />
        {destination ? (
          <ClearButton onPress={() => onDestinationChange('')} />
        ) : null}
      </View>
      
      {/* Search button disabled if either origin or destination is empty */}
      <Button 
        title="Search" 
        onPress={onSearch} 
        disabled={!isSearchEnabled}
        color={isSearchEnabled ? "#2196F3" : "gray"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'white',
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  clearButton: {
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: 'gray',
  },
  suggestion: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  suggestionText: {
    color: 'black',
  },
});

export default SearchBar;
