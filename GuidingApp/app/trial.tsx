import { Dot } from '@/app/classes/geometry';
import { Node } from '@/app/classes/node';
import { Graph, GraphEdge } from '@/app/classes/mapData';

/**
 * Heuristic function for A* (Manhattan distance)
 * @param a Starting point
 * @param b Goal point
 * @returns Estimated cost from a to b
 */
function heuristic(a: Dot, b: Dot): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  
  /**
   * A* algorithm for grid-based pathfinding.
   * @param grid The grid (matrix) where walkable cells are marked (e.g., 0 or 2).
   * @param start Starting Dot
   * @param goal Destination Dot
   * @returns An array of Dot objects representing the shortest path from start to goal.
   */
  function findShortestPath(grid: number[][], start: Dot, goal: Dot): Dot[] {
    const key = (p: Dot) => `${p.x},${p.y}`;
    const openSet: Dot[] = [start];
    const cameFrom: Map<string, Dot> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();
  
    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, goal));
  
    while (openSet.length > 0) {
      // Select the node with the lowest fScore
      let currentIndex = 0;
      let current = openSet[0];
      for (let i = 1; i < openSet.length; i++) {
        if ((fScore.get(key(openSet[i])) || Infinity) < (fScore.get(key(current)) || Infinity)) {
          current = openSet[i];
          currentIndex = i;
        }
      }
  
      // If goal is reached, reconstruct and return the path
      if (current.x === goal.x && current.y === goal.y) {
        const path: Dot[] = [];
        let curKey = key(current);
        path.push(current);
        while (cameFrom.has(curKey)) {
          const prev = cameFrom.get(curKey)!;
          path.push(prev);
          curKey = key(prev);
        }
        return path.reverse();
      }
  
      // Remove current from openSet
      openSet.splice(currentIndex, 1);
  
      // Define neighbors (4-directional movement)
      const neighbors: Dot[] = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
  
      for (const neighbor of neighbors) {
        // Check boundaries (usando optional chaining para garantizar que grid[neighbor.y] exista)
        if (
          neighbor.x < 0 ||
          neighbor.y < 0 ||
          neighbor.y >= grid.length ||
          neighbor.x >= (grid[0]?.length || 0)
        ) {
          continue;
        }
        // Comprueba que la celda sea transitable (suponiendo que 0 o 2 son valores permitidos)
        if (grid[neighbor.y]?.[neighbor.x] !== 0 && grid[neighbor.y]?.[neighbor.x] !== 2) {
          continue;
        }
  
        const tentativeG = (gScore.get(key(current)) || Infinity) + 1;
        if (tentativeG < (gScore.get(key(neighbor)) || Infinity)) {
          cameFrom.set(key(neighbor), current);
          gScore.set(key(neighbor), tentativeG);
          fScore.set(key(neighbor), tentativeG + heuristic(neighbor, goal));
          if (!openSet.find(p => p.x === neighbor.x && p.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    // Si no se encuentra camino, se retorna un array vacío.
    return [];
  }

/**
 * Finds the shortest path between two nodes (by ID) using Dijkstra's algorithm.
 * @param graph The graph containing nodes and edges.
 * @param startId The ID of the start node.
 * @param endId The ID of the destination node.
 * @returns An array with the sequence of node IDs that form the path.
 */
function findPath(graph: Graph, startId: string, endId: string): string[] {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  // Initialize each node's distance to infinity and no predecessor.
  graph.nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });
  distances[startId] = 0;

  // Main Dijkstra loop.
  while (unvisited.size > 0) {
    // Select the unvisited node with the smallest distance.
    let currentId: string | null = null;
    unvisited.forEach((id) => {
      if (currentId === null || distances[id] < distances[currentId]) {
        currentId = id;
      }
    });

    if (currentId === null) break;

    // If we reached the destination, stop.
    if (currentId === endId) break;

    // Remove the current node from the set of unvisited nodes.
    unvisited.delete(currentId);

    // Get all edges starting from the current node.
    const neighbors = graph.edges.filter((edge: GraphEdge) => edge.from === currentId);

    // Relax the distances for each neighbor.
    neighbors.forEach((edge: GraphEdge) => {
      const neighborId = edge.to;
      if (!unvisited.has(neighborId)) return;
      const alt = distances[currentId!] + edge.weight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
      }
    });
  }

  // Reconstruct the path from the destination back to the start.
  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // If the reconstructed path doesn't start with the start node, no path exists.
  if (path[0] !== startId) {
    return []; // No valid path found.
  }
  return path;
}

/**
 * Helper function that returns an array of Node objects representing the graph route.
 * It maps the sequence of node IDs (found by Dijkstra) back to their Node objects.
 *
 * @param graph The graph containing nodes and edges.
 * @param startId The ID of the start node.
 * @param endId The ID of the destination node.
 * @returns An array of Node objects representing the graph route.
 */
function findGraphPath(graph: Graph, startId: string, endId: string): Node[] {
  const pathIds = findPath(graph, startId, endId);
  if (pathIds.length === 0) return [];
  // Map each ID to its corresponding Node. Filter out any potential undefined values.
  return pathIds
    .map((id) => graph.nodes.find((node) => node.id === id))
    .filter((node): node is Node => node !== undefined);
}

/**
 * Computes the complete path on the grid, ensuring that it passes through the sensors
 * of the nodes determined by the graph's edges.
 *
 * @param grid The grid (matrix) representing the map.
 * @param graph The graph containing nodes and edges.
 * @param originNode The origin node.
 * @param destinationNode The destination node.
 * @returns An array of Dot objects representing the full path on the grid.
 */
export function findPathWithDistance(
  grid: number[][],
  graph: Graph,
  originNode: Node,
  destinationNode: Node
): Dot[] {
  // Compute the graph path (route) from origin to destination using node IDs.
  const graphPath: Node[] = findGraphPath(graph, originNode.id, destinationNode.id);
  //console.log(graphPath)
  if (graphPath.length === 0) {
    // If no graph path is found, return an empty path.
    return [];
  }

  // Extract sensor coordinates from the nodes in the graph path.
  // (Assumes that each Node has a "sensor" property of type Dot.)
  const sensorWaypoints: Dot[] = graphPath.map((node) => node.sensor);

  let fullPath: Dot[] = [];
  // For each consecutive pair of sensor waypoints, compute the grid path segment.
  for (let i = 0; i < sensorWaypoints.length - 1; i++) {
    const segmentStart: Dot = sensorWaypoints[i];
    const segmentEnd: Dot = sensorWaypoints[i + 1];
    //console.log(segmentStart.x+ ' '+ segmentEnd.x)
    const segmentPath: Dot[] = findShortestPath(grid, segmentStart, segmentEnd);
    //console.log(segmentPath)
    if (segmentPath.length === 0) {
      // If any segment fails to yield a path, return an empty array.
      return [];
    }
    // Remove the first point of the segment (if not the first segment) to avoid duplicates.
    if (i > 0) {
      segmentPath.shift();
    }
    fullPath = fullPath.concat(segmentPath);
    console.log(fullPath)
  }
  return fullPath;
}
