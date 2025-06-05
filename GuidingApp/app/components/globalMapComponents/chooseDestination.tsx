import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, Text, ActivityIndicator,} from 'react-native';
import { NodeMapDataSearchResultDTO } from '@/app/classes/DTOs';
import { AppContext } from '@/app/AppContext';
import { NodeService } from '@/app/services/nodeService';

interface ChooseDestinationProps {
  isSearchVisible: boolean;
}

const ChooseDestination: React.FC<ChooseDestinationProps> = ({
  isSearchVisible,
}) => {
  // ----------------------------
  // 1. Contexto global
  // ----------------------------
  const {
    targetNode,
    targetMapData,
    setTargetNode,
    setTargetMapData,
  } = useContext(AppContext);

  // ----------------------------
  // 2. Estados locales
  // ----------------------------
  const [query, setQuery] = useState<string>(''); // texto en el TextInput
  const [suggestions, setSuggestions] = useState<NodeMapDataSearchResultDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * shouldSearch controla si en el useEffect lanzamos la llamada
   * a NodeService.searchNodes. Solo se busca cuando el usuario escribe texto no vacío
   * (y no tras una selección).
   */
  const [shouldSearch, setShouldSearch] = useState<boolean>(false);

  // Ref para inicializar el input solo la primera vez a partir del contexto
  const initializedFromContext = useRef<boolean>(false);

  // ----------------------------
  // 3. Inicializar input si ya existe targetNode/targetMapData al montar
  // ----------------------------
  useEffect(() => {
    if (!initializedFromContext.current) {
      if (targetNode && targetMapData) {
        const textoInicial = `${targetNode.name}, ${targetMapData.name}`;
        setQuery(textoInicial);
        setSuggestions([]);
        setShouldSearch(false);
      }
      initializedFromContext.current = true;
    }
  }, []);

  // ----------------------------
  // 4. Efecto para buscar sugerencias cuando cambien `query` y `shouldSearch`
  // ----------------------------
  useEffect(() => {
    if (!shouldSearch) {
      return;
    }

    if (query.trim().length === 0) {
      setSuggestions([]);
      setShouldSearch(false);
      return;
    }

    let isCancelled = false;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const results = await NodeService.searchNodes(query, 5);
        if (!isCancelled) {
          setSuggestions(results);
        }
      } catch (error) {
        console.error('Error buscando nodos:', error);
        if (!isCancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isCancelled = true;
    };
  }, [query, shouldSearch]);

  // ----------------------------
  // 5. onChangeText: controla cuándo activar/desactivar la búsqueda
  // ----------------------------
  const onChangeText = (text: string) => {
    setQuery(text);

    if (text.trim().length === 0) {
      // Si el campo queda vacío:
      setShouldSearch(false);
      setSuggestions([]);
      setTargetNode(null);
      setTargetMapData(null);
    } else {
      setShouldSearch(true);
    }
  };

  // ----------------------------
  // 6. handleSelectSuggestion: al pulsar una recomendación
  // ----------------------------
  const handleSelectSuggestion = (item: NodeMapDataSearchResultDTO) => {
    const { node, mapData } = item;

    // a) Guardamos en contexto
    setTargetNode(node);
    setTargetMapData(mapData);

    // b) Ponemos el texto en el input
    const textoSeleccionado = `${node.name}, ${mapData.name}`;
    setQuery(textoSeleccionado);

    // c) Limpiamos sugerencias y detenemos búsqueda hasta que edite el usuario
    setSuggestions([]);
    setShouldSearch(false);
  };

  // ----------------------------
  // 7. clearAll: vacía input y contexto al pulsar la “X”
  // ----------------------------
  const clearAll = () => {
    setQuery('');
    setSuggestions([]);
    setShouldSearch(false);
    setTargetNode(null);
    setTargetMapData(null);
  };

  return (
    <View style={styles.container}>
      {/* Solo mostrar input si isSearchVisible */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          {/* Contenedor para input + botón “X” */}
          <View style={styles.inputWrapper}>
            <TextInput
              value={query}
              onChangeText={onChangeText}
              placeholder="Buscar nodo o mapa..."
              style={styles.textInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {/* Botón “X” para limpiar */}
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

          {/* Mostrar lista de sugerencias solo si no estamos cargando y hay resultados */}
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
                    {item.node.name} , {item.mapData.name}
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

  // Wrapper que contiene el TextInput y la “X”
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
