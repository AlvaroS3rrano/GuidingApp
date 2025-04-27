import { Dot } from '@/app/classes/geometry';
import { EdgeDTO, MapDataDTO, NodeDTO } from '@/app/classes/DTOs';

type Huristic_Node = {
  point: Dot;
  cost: number;
  heuristic: number;
  parent?: Huristic_Node;
};

export type Segment = {
  start: Dot;
  end: Dot;
};

export type PathResult = {
  nodes: Dot[];      // Key nodes (waypoints) in order
  segments: Segment[]; // Segments between key nodes in order
  fullPath: Dot[];     // The complete path
};

/**
 * Calculates the shortest path between two points in a matrix while keeping a distance of 1 from walls (value 1).
 * Excludes the start and end points from the resulting path.
 * @param matrix - The input matrix.
 * @param start - The starting point as { x, y }.
 * @param end - The destination point as { x, y }.
 * @returns An array of points representing the path (excluding start and end) or an empty array if no path exists.
 */
export function findShortestPath(matrix: number[][], start: Dot, end: Dot, isLastSegment: Boolean): Dot[] {
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
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
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

      return isLastSegment
        ? (path.length > 2 ? path.slice(0, -1) : [])
        : path;

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

function findPath(mapdata: MapDataDTO, startId: number, endId: number): number[] {
  const distances: Record<number, number> = {};
  const previous: Record<number, number | null> = {};
  const unvisited = new Set<number>();

  // Inicializa cada nodo con distancia infinita y sin predecesor.
  mapdata.nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });
  distances[startId] = 0;

  // Bucle principal de Dijkstra.
  while (unvisited.size > 0) {
    let currentId: number | null = null;
    unvisited.forEach((id) => {
      if (currentId === null || distances[id] < distances[currentId]) {
        currentId = id;
      }
    });

    // Si currentId es nulo, sal del bucle.
    if (currentId === null) break;
    
    const curId = currentId;

    // Si hemos llegado al destino, sal del bucle.
    if (curId === endId) break;

    unvisited.delete(curId);

    // Obtén todas las aristas salientes del nodo actual.
    const neighbors = mapdata.edges.filter((edge: EdgeDTO) => edge.fromNode.id === curId);

    // Relaja la distancia de cada vecino.
    neighbors.forEach((edge: EdgeDTO) => {
      const neighborId = edge.toNode.id;
      if (!unvisited.has(neighborId)) return;
      const alt = distances[curId] + edge.weight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = curId;
      }
    });
  }

  // Reconstruye el camino desde el destino hacia el inicio.
  const path: number[] = [];
  let current: number | null = endId;
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
export function findGraphPath(mapData: MapDataDTO, startId: number, endId: number): NodeDTO[] {
  const pathIds = findPath(mapData, startId, endId);
  if (pathIds.length === 0) return [];
  // Map each ID to su correspondiente Node y filtra los posibles undefined.
  return pathIds
    .map((id) => mapData.nodes.find((node) => node.id === id))
    .filter((node): node is NodeDTO => node !== undefined);
}

/**
 * Computes the complete path on the grid, ensuring that it passes through the sensor points
 * of the nodes determined by the graph's edges.
 *
 * @param grid The grid (matrix) representing the map.
 * @param graph The graph containing nodes and edges.
 * @param originNode The origin node.
 * @param destinationNode The destination node.
 * @returns An object containing:
 *          - nodes: The sensor coordinates from the graph path (waypoints).
 *          - segments: An array of grid path segments between each pair of waypoints.
 *          - fullPath: The complete concatenated grid path.
 */
export function findPathWithDistance(
  grid: number[][],
  mapData: MapDataDTO,
  originNode: NodeDTO,
  destinationNode: NodeDTO
): PathResult | null {
  // Compute the graph path (route) from origin to destination using node IDs.
  const graphPath: NodeDTO[] = findGraphPath(mapData, originNode.id, destinationNode.id);
  if (graphPath.length === 0) {
    // If no graph path is found, return null.
    return null;
  }

    // Extrae los waypoints a partir de las propiedades x e y de cada nodo.
    const sensorWaypoints: Dot[] = graphPath.map((node) => ({ x: node.x, y: node.y }));
    let fullPath: Dot[] = [];
    const segments: Segment[] = [];


  // For each consecutive pair of sensor waypoints, compute the grid path segment.
  for (let i = 0; i < sensorWaypoints.length - 1; i++) {
    const segmentStart: Dot = sensorWaypoints[i];
    const segmentEnd: Dot = sensorWaypoints[i + 1];
    const isLastSegment = (i === sensorWaypoints.length - 2);
    const segmentPath: Dot[] = findShortestPath(grid, segmentStart, segmentEnd, isLastSegment);

    if (segmentPath.length === 0) {
      // If any segment fails to yield a path, return null.
      return null;
    }

    // Remove the first point of the segment (if not the first segment) to avoid duplicates.
    if (i > 0) {
      segmentPath.shift();
    }

    // Save the current segment's path.
    segments.push({
      start: segmentStart,
      end: segmentEnd
    });

    // Concatenate the segment path into the full path.
    fullPath = fullPath.concat(segmentPath);
  }

  // Return an object containing the waypoints (nodes), the segments, and the complete path.
  return {
    nodes: sensorWaypoints,
    segments: segments,
    fullPath: fullPath,
  };
}

