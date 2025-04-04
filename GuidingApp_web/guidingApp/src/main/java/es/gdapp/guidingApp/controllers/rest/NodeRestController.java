package es.gdapp.guidingApp.controllers.rest;

import es.gdapp.guidingApp.dto.MapDataDTO;
import es.gdapp.guidingApp.mappers.MapDataMapper;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/nodes")
public class NodeRestController {

    private final NodeService nodeService;
    private final MapDataMapper mapDataMapper;

    @Autowired
    public NodeRestController(NodeService nodeService, MapDataMapper mapDataMapper) {
        this.nodeService = nodeService;
        this.mapDataMapper = mapDataMapper;
    }

    // Obtener todos los nodos
    @GetMapping
    public ResponseEntity<Collection<Node>> getAllNodes() {
        return ResponseEntity.ok(nodeService.getAllNodes());
    }

    // Obtener un nodo por su id
    @GetMapping("/{id}")
    public ResponseEntity<Node> getNodeById(@PathVariable Long id) {
        return nodeService.getNodeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    // Obtener un nodo por beaconId
    @GetMapping("/beacon/{beaconId}")
    public ResponseEntity<Node> getNodeByBeaconId(@PathVariable String beaconId) {
        return nodeService.getNodeByBeaconId(beaconId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    // Nuevo endpoint: Obtener el MapData asociado a un nodo
    @GetMapping("/{beaconId}/mapdata")
    public ResponseEntity<MapDataDTO> getMapDataByBeaconId(@PathVariable String beaconId) {
        return nodeService.getNodeByBeaconId(beaconId)
                .map(node -> {
                    if (node.getMap() == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).<MapDataDTO>body(null);
                    }
                    return ResponseEntity.ok(mapDataMapper.toMapDataDTO(node.getMap()));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

}
