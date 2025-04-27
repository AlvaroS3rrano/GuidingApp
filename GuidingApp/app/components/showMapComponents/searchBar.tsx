import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Pressable, Text } from 'react-native';

type SearchBarProps = {
  origin: string;
  destination: string;
  recommendedOrigin?: string;
  destinationOptions: string[];            // List of possible destination names
  onOriginChange: (text: string) => void;
  onDestinationChange: (text: string) => void;
  onSearch: () => void;
  buttonTitle?: string; // Controls the button title ("Search" or "Preview")
  originError?: string; // Error message for origin input
  destinationError?: string; // Error message for destination input
};

// ClearButton component without hover effect
const ClearButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Pressable onPress={onPress} style={styles.clearButton}>
    <Text style={styles.clearButtonText}>X</Text>
  </Pressable>
);

const SearchBar: React.FC<SearchBarProps> = ({
  origin,
  destination,
  recommendedOrigin,
  destinationOptions,
  onOriginChange,
  onDestinationChange,
  onSearch,
  buttonTitle,
  originError,
  destinationError,
}) => {
  // Suggestion visibility states
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Filtered destination suggestions based on input
  const filteredDestinations = destinationOptions.filter(name =>
    name.toLowerCase().includes(destination.toLowerCase())
  );

  // Determine if search button should be enabled
  const isSearchEnabled = origin.trim().length > 0 && destination.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Origin input and suggestions */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Origin Location"
          value={origin}
          onChangeText={onOriginChange}
          onFocus={() => setShowOriginSuggestions(true)}
          onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 100)}
        />
        {origin ? <ClearButton onPress={() => onOriginChange('')} /> : null}
      </View>
      {showOriginSuggestions && recommendedOrigin && !origin ? (
        <Pressable
          style={styles.suggestion}
          onPress={() => {
            onOriginChange(recommendedOrigin);
            setShowOriginSuggestions(false);
          }}
        >
          <Text style={styles.suggestionText}>{recommendedOrigin}</Text>
        </Pressable>
      ) : null}
      {originError ? <Text style={styles.errorText}>{originError}</Text> : null}

      {/* Destination input and filtered suggestions */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Destination"
          value={destination}
          onChangeText={onDestinationChange}
          onFocus={() => setShowDestSuggestions(true)}
          onBlur={() => setTimeout(() => setShowDestSuggestions(false), 100)}
        />
        {destination ? <ClearButton onPress={() => onDestinationChange('')} /> : null}
      </View>
      {showDestSuggestions && destination.trim().length > 0
        ? filteredDestinations.map((name, idx) => (
            <Pressable
              key={idx}
              style={styles.suggestion}
              onPress={() => {
                onDestinationChange(name);
                setShowDestSuggestions(false);
              }}
            >
              <Text style={styles.suggestionText}>{name}</Text>
            </Pressable>
          ))
        : null}
      {destinationError ? <Text style={styles.errorText}>{destinationError}</Text> : null}

      {/* Search/Preview button */}
      <Button
        title={buttonTitle || 'Search'}
        onPress={onSearch}
        disabled={!isSearchEnabled}
        color={isSearchEnabled ? '#2196F3' : 'gray'}
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
