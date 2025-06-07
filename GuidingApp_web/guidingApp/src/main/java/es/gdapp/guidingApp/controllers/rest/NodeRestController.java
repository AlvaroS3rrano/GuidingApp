package es.gdapp.guidingApp.controllers.rest;

import es.gdapp.guidingApp.dto.MapDataDTO;
import es.gdapp.guidingApp.dto.NodeDTO;
import es.gdapp.guidingApp.dto.NodeMapDataSearchResultDTO;
import es.gdapp.guidingApp.mappers.DataMapper;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/nodes")
public class NodeRestController {

    private final NodeService nodeService;
    private final DataMapper dataMapper;

    @Autowired
    public NodeRestController(NodeService nodeService, DataMapper dataMapper) {
        this.nodeService = nodeService;
        this.dataMapper = dataMapper;
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
                    if (node.getMapData() == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).<MapDataDTO>body(null);
                    }
                    return ResponseEntity.ok(dataMapper.toMapDataDTO(node.getMapData()));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/search")
    public ResponseEntity<List<NodeMapDataSearchResultDTO>> searchNodes(
            @RequestParam("q") String query,
            @RequestParam(name = "limit", required = false, defaultValue = "10") int limit
    ) {
        List<NodeMapDataSearchResultDTO> results = nodeService.searchByText(query, limit);
        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/exits/{mapDataId}")
    public ResponseEntity<List<NodeDTO>> getExitNodes(
            @PathVariable Long mapDataId) {
        List<NodeDTO> exitNodes =
                nodeService.findExitNodesByMapData(mapDataId);

        if (exitNodes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(exitNodes);
    }

    @GetMapping("/entrance/{mapDataId}")
    public ResponseEntity<List<NodeDTO>> getEntranceNodes(
            @PathVariable Long mapDataId) {
        List<NodeDTO> entranceNodes =
                nodeService.findEntranceNodesByMapData(mapDataId);

        if (entranceNodes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(entranceNodes);
    }

}
