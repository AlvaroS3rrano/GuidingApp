import { Node } from './node'; // Your existing Node class

// Define an edge (connection) between two nodes
export interface GraphEdge {
  from: string;       // ID of the source node
  to: string;         // ID of the destination node
  weight: number;    // Weight for the connection
}

// Define the graph structure using the Node class
export interface Graph {
  nodes: Node[];
  edges: GraphEdge[];
}

// Main structure that contains the map name, the initial map, and the graph
export interface MapData {
  name: string;            // Name of the map
  initialMap: number[][];  // Initial map represented as a grid (matrix)
  graph: Graph;            // Graph containing nodes and their connections
}

export interface Path {
  origin: Node;
  destination: Node;
}


if (require.main === module) {
    // Example of instances using your Node class
    const node1 = new Node("node-1", [{ x: 0, y: 0 }, { x: 1, y: 0 }], { x: 0, y: 0 });
    const node2 = new Node("node-2", [{ x: 2, y: 2 }, { x: 3, y: 2 }], { x: 2, y: 2 });
    const node3 = new Node("node-3", [{ x: 4, y: 4 }], { x: 4, y: 4 });

    // Define connections between nodes
    const graphEdges: GraphEdge[] = [
    { from: node1.id, to: node2.id, weight: 5 },
    { from: node2.id, to: node3.id, weight: 3 },
    { from: node1.id, to: node3.id, weight: 8 },
    ];

    // Create the graph with nodes and edges
    const graph: Graph = {
    nodes: [node1, node2, node3],
    edges: graphEdges,
    };

    // Create the main MapData structure
    const mapData: MapData = {
    name: "Ground Floor",
    initialMap: [
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    graph: graph,
    };

    // Example usage: Logging the map data to the console
    console.log("Map Name:", mapData.name);
    console.log("Initial Map:", mapData.initialMap);
    console.log("Graph Nodes:", mapData.graph.nodes);
    console.log("Graph Edges:", mapData.graph.edges);
}
