import { Dot } from '@/app/classes/geometry';
import { Node } from '@/app/classes/node';
import { Graph, GraphEdge } from '@/app/classes/mapData';

type Huristic_Node = {
  point: Dot;
  cost: number;
  heuristic: number;
  parent?: Huristic_Node;
};

/**
 * Calculates the shortest path between two points in a matrix while keeping a distance of 1 from walls (value 1).
 * Excludes the start and end points from the resulting path.
 * @param matrix - The input matrix.
 * @param start - The starting point as { x, y }.
 * @param end - The destination point as { x, y }.
 * @returns An array of points representing the path (excluding start and end) or an empty array if no path exists.
 */
export function findShortestPath(matrix: number[][], start: Dot, end: Dot): Dot[] {
  const height = matrix.length;
  const width = matrix[0].length;

  const isValid = (x: number, y: number) =>
    x >= 0 && x < width && y >= 0 && y < height && matrix[height - 1 - y][x] !== 1;

  const getNeighbors = ({ x, y }: Dot): Dot[] => {
    const neighbors: Dot[] = [
      { x, y: y - 1 }, // Up
      { x, y: y + 1 }, // Down
      { x: x - 1, y }, // Left
      { x: x + 1, y }  // Right
    ];
    return neighbors.filter(({ x, y }) => isValid(x, y));
  };

  const calculateDistance = (a: Dot, b: Dot) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  const calculateProximityToWalls = ({ x, y }: Dot) => {
    const offsets = [
      { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
      { x: 0, y: -1 },                 { x: 0, y: 1 },
      { x: 1, y: -1 }, { x: 1, y: 0 },  { x: 1, y: 1 },
    ];
    return offsets.reduce((count, { x: dx, y: dy }) => {
      const nx = x + dx;
      const ny = y + dy;
      return count + (isValid(nx, ny) && matrix[height - 1 - ny][nx] === 1 ? 1 : 0);
    }, 0);
  };

  const startNode: Huristic_Node = {
    point: start,
    cost: 0,
    heuristic: calculateDistance(start, end),
  };

  const openSet: Huristic_Node[] = [startNode];
  const closedSet = new Set<string>();

  const nodeKey = ({ x, y }: Dot) => `${x},${y}`;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.cost + a.heuristic - (b.cost + b.heuristic));
    const currentNode = openSet.shift()!;

    if (currentNode.point.x === end.x && currentNode.point.y === end.y) {
      const path: Dot[] = [];
      let node: Huristic_Node | undefined = currentNode;
      while (node) {
        path.unshift(node.point);
        node = node.parent;
      }
      return path.length > 2 ? path.slice(1, -1) : [];
    }

    closedSet.add(nodeKey(currentNode.point));

    for (const neighbor of getNeighbors(currentNode.point)) {
      const key = nodeKey(neighbor);
      if (closedSet.has(key)) continue;

      const proximityPenalty = calculateProximityToWalls(neighbor);
      const cost = currentNode.cost + 1 + proximityPenalty;

      const existingNode = openSet.find(n => n.point.x === neighbor.x && n.point.y === neighbor.y);
      if (existingNode) {
        if (cost < existingNode.cost) {
          existingNode.cost = cost;
          existingNode.parent = currentNode;
        }
      } else {
        openSet.push({
          point: neighbor,
          cost,
          heuristic: calculateDistance(neighbor, end),
          parent: currentNode,
        });
      }
    }
  }
  return [];
}

function findPath(graph: Graph, startId: string, endId: string): string[] {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();
  
    // Inicializa cada nodo con distancia infinita y sin predecesor.
    graph.nodes.forEach((node) => {
      distances[node.id] = Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });
    distances[startId] = 0;
  
    // Bucle principal de Dijkstra.
    while (unvisited.size > 0) {
      let currentId: string | null = null;
      unvisited.forEach((id) => {
        if (currentId === null || distances[id] < distances[currentId]) {
          currentId = id;
        }
      });
  
      // Si currentId es nulo, sal del bucle.
      if (currentId === null) break;
      // Aquí reafirmamos que currentId es un string.
      const curId = currentId;
  
      // Si hemos llegado al destino, sal del bucle.
      if (curId === endId) break;
  
      unvisited.delete(curId);
  
      // Obtén todas las aristas salientes del nodo actual.
      const neighbors = graph.edges.filter((edge: GraphEdge) => edge.from === curId);
  
      // Relaja la distancia de cada vecino.
      neighbors.forEach((edge: GraphEdge) => {
        const neighborId = edge.to;
        if (!unvisited.has(neighborId)) return;
        const alt = distances[curId] + edge.weight;
        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          previous[neighborId] = curId;
        }
      });
    }
  
    // Reconstruye el camino desde el destino hacia el inicio.
    const path: string[] = [];
    let current: string | null = endId;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
  
    // Si el camino reconstruido no comienza en el nodo de inicio, no se encontró un camino.
    if (path[0] !== startId) {
      return [];
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
  // Map each ID to su correspondiente Node y filtra los posibles undefined.
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
    const segmentPath: Dot[] = findShortestPath(grid, segmentStart, segmentEnd);
    if (segmentPath.length === 0) {
      // If any segment fails to yield a path, return an empty array.
      return [];
    }
    // Remove the first point of the segment (if not the first segment) to avoid duplicates.
    if (i > 0) {
      segmentPath.shift();
    }
    fullPath = fullPath.concat(segmentPath);
  }
  return fullPath;
}
