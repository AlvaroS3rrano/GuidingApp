package es.gdapp.guidingApp.controllers.rest;

import es.gdapp.guidingApp.dto.MapDataDTO;
import es.gdapp.guidingApp.mappers.MapDataMapper;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.services.MapDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Collection<MapDataDTO>> getAllMapData() {
        Collection<MapDataDTO> mapDataDTOs = mapDataService.getAllMapData().stream()
                .map(mapDataMapper::toMapDataDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(mapDataDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MapDataDTO> getMapDataById(@PathVariable Long id) {
        return mapDataService.getMapDataById(id)
                .map(mapData -> ResponseEntity.ok(mapDataMapper.toMapDataDTO(mapData)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }
}
