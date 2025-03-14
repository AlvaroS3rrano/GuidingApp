package es.gdapp.guidingApp.dataBaseTests;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.MapDataService;
import es.gdapp.guidingApp.services.NodeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class NodeServiceTest {

    @Autowired
    private NodeService nodeService;

    @Autowired
    private MapDataService mapDataService;

    @Test
    public void testCreateRetrieveUpdateDeleteNode() {
        // Create a MapData first (since Node depends on it)
        MapData mapData = new MapData("Test Map for Node", 90.0, 4, 4);
        mapData = mapDataService.saveMapData(mapData);

        // Create a new Node and associate it with the MapData
        Node node = new Node();
        node.setName("Test Node");
        node.setBeaconId("Beacon001");
        node.setX(1);
        node.setY(2);
        node.setArea(new int[][] {{1, 0}, {0, 1}});
        node.setMap(mapData);

        Node saved = nodeService.saveNode(node);
        assertNotNull(saved.getId(), "Node ID should be set after saving");

        // Retrieve by id
        Node retrieved = nodeService.getNodeById(saved.getId())
                .orElseThrow(() -> new AssertionError("Node not found"));
        assertEquals("Test Node", retrieved.getName(), "Node name should match");

        // Update: change node name and update
        retrieved.setName("Updated Node");
        Node updated = nodeService.updateNode(retrieved.getId(), retrieved);
        assertEquals("Updated Node", updated.getName(), "Node name should be updated");

        // Delete and verify deletion
        nodeService.deleteNode(updated.getId());
        assertFalse(nodeService.getNodeById(updated.getId()).isPresent(), "Node should be deleted");
    }
}

