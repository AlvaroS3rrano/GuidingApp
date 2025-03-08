package es.gdapp.guidingApp.services;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.repositories.MapDataRepository;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class MapDataService {

    private final MapDataRepository mapDataRepository;

    public MapDataService(MapDataRepository mapDataRepository) {
        this.mapDataRepository = mapDataRepository;
    }

    // Create or update a MapData entry
    public MapData saveMapData(Long id, MapData mapData) {
        return mapDataRepository.save(id, mapData);
    }

    // Retrieve a MapData entry by its id
    public Optional<MapData> getMapDataById(Long id) {
        return mapDataRepository.findById(id);
    }

    // Retrieve all MapData entries
    public Collection<MapData> getAllMapData() {
        return mapDataRepository.findAll();
    }

    // Update an existing MapData (throws exception if not found)
    public MapData updateMapData(Long id, MapData mapData) {
        if (mapDataRepository.findById(id).isPresent()) {
            return mapDataRepository.save(id, mapData);
        }
        throw new NoSuchElementException("MapData not found with id: " + id);
    }

    // Delete a MapData entry by its id
    public void deleteMapData(Long id) {
        mapDataRepository.delete(id);
    }
}
