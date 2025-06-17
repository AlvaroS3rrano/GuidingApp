// ChooseDestination.tsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { NodeMapDataSearchResultDTO } from '@/app/classes/DTOs';
import { AppContext } from '@/app/AppContext';
import { NodeService } from '@/app/services/nodeService';

interface ChooseDestinationProps {
  isSearchVisible: boolean;
}

const ChooseDestination: React.FC<ChooseDestinationProps> = ({ isSearchVisible }) => {
  const { targetNode, targetMapData, setTargetNode, setTargetMapData } = useContext(AppContext);

  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<NodeMapDataSearchResultDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [shouldSearch, setShouldSearch] = useState<boolean>(false);

  useEffect(() => {
  if (targetNode && targetMapData) {
    setQuery(`${targetNode.name}, ${targetMapData.name}`);
    setSuggestions([]);
    setShouldSearch(false);
  } else {
    // Si se limpian en contexto, dejamos el input vacío
    setQuery('');
    setSuggestions([]);
    setShouldSearch(false);
  }
}, [targetNode, targetMapData]);

  // Fetch suggestions when query changes and search is enabled
  useEffect(() => {
    if (!shouldSearch) return;
    if (query.trim().length === 0) {
      setSuggestions([]);
      setShouldSearch(false);
      return;
    }

    let cancelled = false;
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const results = await NodeService.searchNodes(query, 5);
        if (!cancelled) setSuggestions(results);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [query, shouldSearch]);

  // Handle text input changes
  const onChangeText = (text: string) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setShouldSearch(false);
      setSuggestions([]);
      setTargetNode(null);
      setTargetMapData(null);
    } else {
      setShouldSearch(true);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (item: NodeMapDataSearchResultDTO) => {
    const { node, mapData } = item;
    setTargetNode(node);
    setTargetMapData(mapData);
    setQuery(`${node.name}, ${mapData.name}`);
    setSuggestions([]);
    setShouldSearch(false);
  };

  // Clear input and context values
  const clearAll = () => {
    setQuery('');
    setSuggestions([]);
    setShouldSearch(false);
    setTargetNode(null);
    setTargetMapData(null);
  };

  return (
    <View style={styles.container}>
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={query}
              onChangeText={onChangeText}
              placeholder="Search node or map..."
              style={styles.textInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          )}

          {!loading && suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => `${item.node.id}-${item.mapData.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Text style={styles.suggestionText}>
                    {item.node.name}, {item.mapData.name}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 40,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#888',
  },
  loadingContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  suggestionsList: {
    marginTop: 4,
  },
  suggestionItem: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
});

export default ChooseDestination;
