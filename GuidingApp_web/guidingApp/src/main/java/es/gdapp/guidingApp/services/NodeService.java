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

    // Create or update a Node
    public Node saveNode(Node node) {
        return nodeRepository.save(node.getId(), node);
    }

    // Retrieve a Node by its id
    public Optional<Node> getNodeById(Long id) {
        return nodeRepository.findById(id);
    }

    // Retrieve all Nodes
    public Collection<Node> getAllNodes() {
        return nodeRepository.findAll();
    }

    // Update an existing Node (throws exception if not found)
    public Node updateNode(Node node) {
        if (nodeRepository.findById(node.getId()).isPresent()) {
            return nodeRepository.save(node.getId(), node);
        }
        throw new NoSuchElementException("Node not found with id: " + node.getId());
    }

    // Delete a Node by its id
    public void deleteNode(Long id) {
        nodeRepository.delete(id);
    }
}
