package es.gdapp.guidingApp.services;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.repositories.MapDataRepository;
import es.gdapp.guidingApp.repositories.NodeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class DatabaseInitializer {

    @Autowired
    private MapDataRepository mapDataRepository;

    @Autowired
    private NodeRepository nodeRepository;

    @PostConstruct
    public void init() {
        // Create a new MapData instance with a 5x5 matrix and a north angle of 0.0
        MapData mapData = new MapData("Default Map", 0.0, 5, 5);

        // Create a couple of Node instances and associate them with the map
        Node node1 = new Node();
        node1.setName("Node A");
        node1.setBeaconId("Beacon_A");
        node1.setX(1);
        node1.setY(2);
        node1.setArea(new int[][] { {1, 1}, {1, 1} });
        node1.setMap(mapData);

        Node node2 = new Node();
        node2.setName("Node B");
        node2.setBeaconId("Beacon_B");
        node2.setX(3);
        node2.setY(4);
        node2.setArea(new int[][] { {0, 1}, {1, 0} });
        node2.setMap(mapData);

        // Initialize the nodes list in MapData and add nodes
        mapData.setNodes(new ArrayList<>());
        mapData.getNodes().add(node1);
        mapData.getNodes().add(node2);

        // Save the MapData. If cascading is enabled on the relationship,
        // the associated nodes will be saved automatically.
        mapDataRepository.save(mapData);
    }
}
