package es.gdapp.guidingApp.controllers.rest;

import es.gdapp.guidingApp.dto.MapDataDTO;
import es.gdapp.guidingApp.mappers.MapDataMapper;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.services.MapDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mapdata")
public class MapDataRestController {

    private final MapDataService mapDataService;
    private final MapDataMapper mapDataMapper;

    @Autowired
    public MapDataRestController(MapDataService mapDataService, MapDataMapper mapDataMapper) {
        this.mapDataService = mapDataService;
        this.mapDataMapper = mapDataMapper;
    }

    @GetMapping
    public Collection<MapDataDTO> getAllMapData() {
        return mapDataService.getAllMapData().stream()
                .map(mapDataMapper::toMapDataDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public MapDataDTO getMapDataById(@PathVariable Long id) {
        MapData mapData = mapDataService.getMapDataById(id)
                .orElseThrow(() -> new RuntimeException("MapData not found with id: " + id));
        return mapDataMapper.toMapDataDTO(mapData);
    }

}

