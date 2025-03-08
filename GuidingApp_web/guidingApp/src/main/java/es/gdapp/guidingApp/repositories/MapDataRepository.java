package es.gdapp.guidingApp.repositories;

import es.gdapp.guidingApp.models.MapData;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class MapDataRepository {

    // In-memory storage for MapData objects
    private final Map<Long, MapData> mapDataStorage = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // Sample MapData entries
        MapData sampleMap1 = new MapData("Sample Map 1", 0.0, 5, 5);
        MapData sampleMap2 = new MapData("Sample Map 2", 45.0, 10, 10);

        mapDataStorage.put(1L, sampleMap1);
        mapDataStorage.put(2L, sampleMap2);
    }

    public MapData save(Long id, MapData mapData) {
        mapDataStorage.put(id, mapData);
        return mapData;
    }

    public Optional<MapData> findById(Long id) {
        return Optional.ofNullable(mapDataStorage.get(id));
    }

    public Collection<MapData> findAll() {
        return mapDataStorage.values();
    }

    public void delete(Long id) {
        mapDataStorage.remove(id);
    }
}
