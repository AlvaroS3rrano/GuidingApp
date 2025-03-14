package es.gdapp.guidingApp.controllers;

import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/nodes")
public class NodeRestController {

    private final NodeService nodeService;

    @Autowired
    public NodeRestController(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    // Retrieve all nodes
    @GetMapping
    public Collection<Node> getAllNodes() {
        return nodeService.getAllNodes();
    }

    // Retrieve a single node by id
    @GetMapping("/{id}")
    public Node getNodeById(@PathVariable Long id) {
        return nodeService.getNodeById(id)
                .orElseThrow(() -> new RuntimeException("Node not found with id: " + id));
    }

    // Create a new node
    @PostMapping
    public Node createNode(@RequestBody Node node) {
        return nodeService.saveNode(node);
    }

    // Delete a node by id
    @DeleteMapping("/{id}")
    public void deleteNode(@PathVariable Long id) {
        nodeService.deleteNode(id);
    }
}
