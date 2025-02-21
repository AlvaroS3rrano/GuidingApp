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
 * - Uses the buttonTitle prop to display "Search" or "Preview" regardless of whether the button is enabled.
 * - If the entered value is not found in the locations dictionary, displays an error message below the input.
 *
 * Usage:
 * - The SearchBar component is used within ShowMap to capture user input for map navigation.
 * - It passes updated values back to the parent via onOriginChange, onDestinationChange, and onSearch callbacks.
 */

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Pressable, Text } from 'react-native';

type SearchBarProps = {
  origin: string;
  destination: string;
  recommendedOrigin?: string;
  onOriginChange: (text: string) => void;
  onDestinationChange: (text: string) => void;
  onSearch: () => void;
  buttonTitle?: string; // Controls the button title ("Search" or "Preview")
  originError?: string; // Error message for origin input
  destinationError?: string; // Error message for destination input
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
  buttonTitle,
  originError,
  destinationError,
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
            setTimeout(() => setShowSuggestions(false), 100);
          }}
        />
        {origin ? <ClearButton onPress={() => onOriginChange('')} /> : null}
      </View>
      {/* Display recommendation if available and input is empty */}
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
      {/* If origin input is not found in the dictionary, show error message */}
      {originError ? <Text style={styles.errorText}>{originError}</Text> : null}
      
      {/* Destination input container with clear button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Destination"
          value={destination}
          onChangeText={onDestinationChange}
        />
        {destination ? <ClearButton onPress={() => onDestinationChange('')} /> : null}
      </View>
      {/* If destination input is not found, show error message */}
      {destinationError ? <Text style={styles.errorText}>{destinationError}</Text> : null}
      
      {/* Button always displays the provided title (Search/Preview) */}
      <Button 
        title={buttonTitle || "Search"} 
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
    backgroundColor: 'transparent',
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
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
    marginBottom: 5,
  },
  suggestionText: {
    color: 'black',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default SearchBar;
