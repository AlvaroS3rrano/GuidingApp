package es.gdapp.guidingApp.controllers.rest;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.services.MapDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/mapdata")
public class MapDataRestController {

    private final MapDataService mapDataService;

    @Autowired
    public MapDataRestController(MapDataService mapDataService) {
        this.mapDataService = mapDataService;
    }

    // Retrieve all map data entries
    @GetMapping
    public Collection<MapData> getAllMapData() {
        return mapDataService.getAllMapData();
    }

    // Retrieve a single MapData by id
    @GetMapping("/{id}")
    public MapData getMapDataById(@PathVariable Long id) {
        return mapDataService.getMapDataById(id)
                .orElseThrow(() -> new RuntimeException("MapData not found with id: " + id));
    }

    // Create a new MapData entry
    @PostMapping("/{id}")
    public MapData createMapData(@RequestBody MapData mapData) {
        return mapDataService.saveMapData(mapData);
    }

    // Update an existing MapData entry
    @PutMapping("/{id}")
    public MapData updateMapData(@PathVariable Long id, @RequestBody MapData mapData) {
        return mapDataService.updateMapData(id, mapData);
    }

    // Delete a MapData entry by id
    @DeleteMapping("/{id}")
    public void deleteMapData(@PathVariable Long id) {
        mapDataService.deleteMapData(id);
    }
}
