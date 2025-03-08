package es.gdapp.guidingApp.repositories;

import es.gdapp.guidingApp.models.Node;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;


import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class NodeRepository {

    // In-memory storage for Node objects
    private final Map<Long, Node> nodeStorage = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // Creating a sample area matrix (3x3) with example values
        int[][] sampleArea = new int[3][3];
        for (int i = 0; i < sampleArea.length; i++) {
            for (int j = 0; j < sampleArea[i].length; j++) {
                sampleArea[i][j] = i + j; // Example values
            }
        }

        // Sample Node entries
        Node sampleNode1 = new Node(1L, "Node 1", "d4fcb04a6573ea399df3adbf06f91b38", 10, 20, 1L, sampleArea);
        Node sampleNode2 = new Node(2L, "Node 2", "15c210b9f1ea2e121131bba29e8cc90a", 30, 40, 1L, sampleArea);

        nodeStorage.put(1L, sampleNode1);
        nodeStorage.put(2L, sampleNode2);
    }

    public Node save(Long id, Node node) {
        nodeStorage.put(id, node);
        return node;
    }

    public Optional<Node> findById(Long id) {
        return Optional.ofNullable(nodeStorage.get(id));
    }

    public Collection<Node> findAll() {
        return nodeStorage.values();
    }

    public void delete(Long id) {
        nodeStorage.remove(id);
    }
}
