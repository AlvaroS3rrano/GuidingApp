package es.gdapp.guidingApp.services;

import es.gdapp.guidingApp.models.Edge;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.NamedMatrix;
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
        MapData mapData = new MapData("Aulario II", 250.0, 40.335184, -3.877456, "Example", 11, 16);
        MapData mapData2 = new MapData("Ampliación del Rectorado", 70.0, 40.3380278, -3.8736389, "Example", 11, 16);
        MapData mapData3 = new MapData("Aulario I", 250.0, 40.335722, -3.876528, "Example", 11, 16);
        int[][] grid = {
                {0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
        };

        int[][] grid2 = {
                {0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0},
                {0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0},
                {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
        };

        mapData.putMatrix(0, "First floor", grid);
        mapData.putMatrix(1, "Second floor", grid2);
        mapData2.putMatrix(0, "First floor", grid);
        mapData2.putMatrix(1, "Second floor", grid2);
        mapData3.putMatrix(0, "First floor", grid);
        mapData3.putMatrix(1, "Second floor", grid2);

        // Nodes for mapData
        Node node1 = new Node(
                "Main Entrance",
                "d4fcb04a6573ea399df3adbf06f91b38",
                0,
                true,
                true,
                14,
                2,
                new int[][]{{11, 2}, {17, 2}, {17, 5}, {11, 5}},
                mapData
        );

        Node aI_central_hall = new Node(
                "Central Hall",
                "15c210b9f1ea2e121131bba29e8cc90a",
                0,
                false,
                false,
                14,
                6,
                new int[][]{{11, 2}, {17, 2}, {17, 5}, {11, 5}},
                mapData
        );

        Node node2 = new Node(
                "Node 2",
                "hola",
                0,
                false,
                false,
                6,
                7,
                new int[][]{{0, 0}, {10, 0}, {10, 5}, {0, 5}},
                mapData
        );

        Node node3 = new Node(
                "Node 3",
                "530801241127a8aad378170fdbabbd17",
                1,
                false,
                false,
                6,
                9,
                new int[][]{{0, 0}, {10, 0}, {10, 5}, {0, 5}},
                mapData
        );

        Node node4 = new Node(
                "Class 203",
                "lkajsdlkj",
                1,
                false,
                false,
                6,
                12,
                new int[][]{{0, 5}, {10, 5}, {10, 10}, {0, 10}},
                mapData
        );

// Associate nodes to mapData
        mapData.setNodes(new ArrayList<>(List.of(node1, aI_central_hall, node2, node3, node4)));

// Edges
        List<Edge> edges = new ArrayList<>();
        edges.add(new Edge(node1, aI_central_hall, 5, "From the entrance, proceed to the hall", mapData));
        edges.add(new Edge(aI_central_hall, node2, 5, "From the hall, proceed to the hall", mapData));
        edges.add(new Edge(aI_central_hall, node1, 5, "from the hall, straight to the exit", mapData));
        edges.add(new Edge(node2, aI_central_hall, 5, "de 2 a 1", mapData));
        edges.add(new Edge(node2, node3, 5, "de 2 a 3", mapData));
        edges.add(new Edge(node3, node4, 5, "de 3 a 4", mapData));
        edges.add(new Edge(node4, node3, 5, "de 4 a 3", mapData));
        edges.add(new Edge(node3, node2, 5, "de 3 a 2", mapData));

        mapData.setEdges(edges);
        mapDataRepository.save(mapData);

// Node for mapData2
        Node node5 = new Node(
                "Entrance",
                "later",
                0,
                true,
                true,
                14,
                4,
                new int[][]{{11, 2}, {17, 2}, {17, 5}, {11, 5}},
                mapData2
        );

        mapData2.setNodes(new ArrayList<>(List.of(node5)));
        mapDataRepository.save(mapData2);

// Nodes for mapData3
        Node entranceNode = new Node(  // green
                "Main Entrance",
                "c36a2cf3dd7341fd57df9b60b7ac4a10",
                0,
                true,
                true,
                14,
                2,
                new int[][]{{9, 2}, {11, 2}, {11, 4}, {9, 4}},
                mapData3
        );

        Node hallNode = new Node( // blue
                "Central Hall",
                "fc0ed82db1f5f61e6eb4f270dc5eda3c",
                0,
                false,
                false,
                14,
                6,
                new int[][]{{13, 6}, {15, 6}, {15, 8}, {13, 8}},
                mapData3
        );

        Node classroomNode = new Node( // purple
                "Class 101",
                "3d4721ba9b35c9b90f6a81e6ba915811",
                0,
                false,
                false,
                6,
                3,
                new int[][]{{7, 9}, {9, 9}, {9, 11}, {7, 11}},
                mapData3
        );

        Node stairNode1 = new Node(
                "Stairs f0",
                "sdfsd",
                0,
                false,
                false,
                6,
                7,
                new int[][]{{7, 9}, {9, 9}, {9, 11}, {7, 11}},
                mapData3
        );

        Node stairNode2 = new Node(
                "Stairs f1",
                "sdf",
                1,
                false,
                false,
                6,
                9,
                new int[][]{{7, 9}, {9, 9}, {9, 11}, {7, 11}},
                mapData3
        );

        Node class203 = new Node(
                "class 203",
                "sdf",
                1,
                false,
                false,
                6,
                12,
                new int[][]{{7, 9}, {9, 9}, {9, 11}, {7, 11}},
                mapData3
        );

        mapData3.setNodes(new ArrayList<>(List.of(entranceNode, hallNode, classroomNode, stairNode1, stairNode2, class203)));

        List<Edge> edges2 = new ArrayList<>();
        edges2.add(new Edge(entranceNode, hallNode, 5, "From the entrance, proceed to the hall", mapData3));
        edges2.add(new Edge(hallNode, entranceNode, 5, "From the hall, proceed to the hall", mapData3));
        edges2.add(new Edge(hallNode, classroomNode, 5, "from the hall, straight to the exit", mapData3));
        edges2.add(new Edge(classroomNode, hallNode, 5, "de 2 a 1", mapData3));
        edges2.add(new Edge(hallNode, stairNode1, 5, "de 2 a 1", mapData3));
        edges2.add(new Edge(stairNode1, hallNode, 5, "de 2 a 1", mapData3));
        edges2.add(new Edge(stairNode1, stairNode2, 5, "de 2 a 1", mapData3));
        edges2.add(new Edge(stairNode2, stairNode1, 5, "de 2 a 1", mapData3));
        edges2.add(new Edge(stairNode2, class203, 5, "de 2 a 1", mapData3));
        edges2.add(new Edge(class203, stairNode2, 5, "de 2 a 1", mapData3));

        mapData3.setEdges(edges2);
        mapDataRepository.save(mapData3);



    }
}
