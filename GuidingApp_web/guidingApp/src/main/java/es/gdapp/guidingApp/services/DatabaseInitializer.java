package es.gdapp.guidingApp.services;

import es.gdapp.guidingApp.models.Edge;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.repositories.MapDataRepository;
import es.gdapp.guidingApp.repositories.NodeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class DatabaseInitializer {

    @Autowired
    private MapDataRepository mapDataRepository;

    @Autowired
    private NodeRepository nodeRepository;

    @PostConstruct
    public void init() {
        // Create a new MapData instance with a 5x5 matrix and a north angle of 0.0
        MapData mapData = new MapData("Default Map", 0.0, 11, 16);

        List<List<Integer>> coordinates = new ArrayList<>();
        coordinates.add(Arrays.asList(0, 0));
        coordinates.add(Arrays.asList(15, 0));
        coordinates.add(Arrays.asList(15, 5));
        coordinates.add(Arrays.asList(10, 5));
        coordinates.add(Arrays.asList(10, 10));
        coordinates.add(Arrays.asList(0, 10));

        mapData.connectCoordinates(coordinates, 1);

        // Create a couple of Node instances and associate them with the map
        Node node1 = new Node();
        node1.setName("Node A");
        node1.setBeaconId("d4fcb04a6573ea399df3adbf06f91b38");
        node1.setX(13);
        node1.setY(2);
        node1.setArea(new int[][] { {10, 0}, {15, 0}, {15, 5}, {10, 5} });
        node1.setMap(mapData);

        Node node2 = new Node();
        node2.setName("Node B");
        node2.setBeaconId("15c210b9f1ea2e121131bba29e8cc90a");
        node2.setX(3);
        node2.setY(8);
        node2.setArea(new int[][] { {0, 5}, {10, 5}, {10, 10}, {0, 10} });
        node2.setMap(mapData);

        Node node3 = new Node();
        node3.setName("Node C");
        node3.setBeaconId("530801241127a8aad378170fdbabbd17");
        node3.setX(5);
        node3.setY(3);
        node3.setArea(new int[][] { {0, 0}, {10, 0}, {10, 5}, {0, 5} });
        node3.setMap(mapData);

        // Initialize the nodes list in MapData and add nodes
        mapData.setNodes(new ArrayList<>());
        mapData.getNodes().add(node1);
        mapData.getNodes().add(node2);
        mapData.getNodes().add(node3);

        List<Edge> edges = new ArrayList<>();
        Edge edge1 = new Edge(node1, node2);
        edge1.setWeight(5);
        edge1.setMapData(mapData);

        Edge edge2 = new Edge(node2, node1);
        edge2.setMapData(mapData);
        edge2.setWeight(5);

        Edge edge3 = new Edge(node3, node1);
        edge3.setMapData(mapData);
        edge3.setWeight(5);

        Edge edge4 = new Edge(node2, node3);
        edge4.setMapData(mapData);
        edge4.setWeight(5);

        edges.add(edge1);
        edges.add(edge2);
        edges.add(edge3);
        edges.add(edge4);

        mapData.setEdges(edges);

        // Save the MapData. If cascading is enabled on the relationship,
        // the associated nodes will be saved automatically.
        mapDataRepository.save(mapData);
    }
}
