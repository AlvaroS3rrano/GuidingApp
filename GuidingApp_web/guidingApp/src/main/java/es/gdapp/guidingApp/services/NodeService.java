package es.gdapp.guidingApp.services;

import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.repositories.NodeRepository;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class NodeService {

    private final NodeRepository nodeRepository;

    public NodeService(NodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    // Create or update a Node entry
    public Node saveNode(Node node) {
        return nodeRepository.save(node);
    }

    // Retrieve a Node by its id
    public Optional<Node> getNodeById(Long id) {
        return nodeRepository.findById(id);
    }

    // Retrieve all Node entries
    public Collection<Node> getAllNodes() {
        return nodeRepository.findAll();
    }

    // Retrieve a Node by its beaconId
    public Optional<Node> getNodeByBeaconId(String beaconId) {
        return nodeRepository.findByBeaconId(beaconId);
    }

    // Update an existing Node (throws exception if not found)
    public Node updateNode(Long id, Node node) {
        if (nodeRepository.findById(id).isPresent()) {
            node.setId(id);
            return nodeRepository.save(node);
        }
        throw new NoSuchElementException("Node not found with id: " + id);
    }

    // Delete a Node entry by its id
    public void deleteNode(Long id) {
        nodeRepository.deleteById(id);
    }
}
