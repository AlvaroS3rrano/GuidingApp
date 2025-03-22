package es.gdapp.guidingApp.services;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.repositories.MapDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public MapData saveMapData(MapData mapData) {
        return mapDataRepository.save(mapData);
    }

    public Optional<MapData> getMapDataById(Long id) {
        return mapDataRepository.findById(id);
    }

    public Collection<MapData> getAllMapData() {
        return mapDataRepository.findAll();
    }

    public MapData updateMapData(Long id, MapData mapData) {
        if (mapDataRepository.findById(id).isPresent()) {
            // Optionally, you can set the id explicitly before saving
            mapData.setId(id);
            return mapDataRepository.save(mapData);
        }
        throw new NoSuchElementException("MapData not found with id: " + id);
    }

    public void deleteMapData(Long id) {
        mapDataRepository.deleteById(id);
    }

    public Page<MapData> getMapDataPage(Pageable pageable) {
        return mapDataRepository.findAll(pageable);
    }
}
