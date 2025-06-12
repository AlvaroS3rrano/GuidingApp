import { Dot } from '@/app/classes/geometry';
import { EdgeDTO, MapDataDTO, NodeDTO } from '@/app/classes/DTOs';
import { findShortestPathInMatrix } from '@/app/algorithms/findShortestPathInMatrix';
import { findPathAStar } from '@/app/algorithms/findPathAStar';


interface DotWithFloor {
  dot: Dot;
  node_id: number;
  floor: number;
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
export function findGraphPath(
  mapData: MapDataDTO,
  startId: number,
  endId: number
): NodeDTO[] {
  const pathIds = findPathAStar(mapData, startId, endId);
  if (pathIds.length === 0) return [];
  // Map each ID to its corresponding Node and filter out any undefined values.
  return pathIds
    .map((id) => mapData.nodes.find((node) => node.id === id))
    .filter((node): node is NodeDTO => node !== undefined);
}

/**
 * Returns the graph path of nodes from origin to destination,
 * grouped by floor in traversal order.
 *
 * @param mapData - Complete map data
 * @param originNode - Starting node
 * @param destinationNode - Destination node
 * @returns An array of objects each containing a floor number and
 *          its list of waypoints (DotWithFloor), or null if no path is found
 */
export function getGraphPathByFloor(
  mapData: MapDataDTO,
  originNode: NodeDTO,
  destinationNode: NodeDTO
): Array<{ floor: number; nodes: DotWithFloor[] }> | null {
  // 1. Compute the graph path (node IDs) across the entire map
  const graphPath = findGraphPath(mapData, originNode.id, destinationNode.id);
  if (graphPath.length === 0) {
    return null;
  }

  // 2. Convert each node to a waypoint with coordinates and floor number
  const waypoints: DotWithFloor[] = graphPath.map(node => ({
    dot: { x: node.x, y: node.y },
    node_id: node.id,
    floor: node.floorNumber!,
  }));

  // 3. Group waypoints by floor in the order they appear
  const sequences: Array<{ floor: number; nodes: DotWithFloor[] }> = [];
  let currentFloor = waypoints[0].floor;
  let currentNodes: DotWithFloor[] = [];

  for (const waypoint of waypoints) {
    if (waypoint.floor !== currentFloor) {
      sequences.push({ floor: currentFloor, nodes: currentNodes });
      currentFloor = waypoint.floor;
      currentNodes = [];
    }
    currentNodes.push(waypoint);
  }
  // Add the last group
  sequences.push({ floor: currentFloor, nodes: currentNodes });

  return sequences;
}

/**
 * Given a single-floor grid and waypoints on that floor,
 * returns the full path between those waypoints within the grid.
 *
 * @param grid - 2D matrix representing the floor
 * @param floorWaypoints - Array of coordinates (Dot) in traversal order
 * @returns An array of points (Dot[]) representing the full path,
 *          or null if any segment has no valid path
 */
export function findFullPathOnFloor(
  grid: number[][],
  floorWaypoints: Dot[]
): Dot[] | null {
  if (floorWaypoints.length < 2) {
    return floorWaypoints;
  }
  let fullPath: Dot[] = [];

  for (let i = 0; i < floorWaypoints.length - 1; i++) {
    const start = floorWaypoints[i];
    const end = floorWaypoints[i + 1];
    const isLastSegment = i === floorWaypoints.length - 2;

    const segmentPath = findShortestPathInMatrix(grid, start, end, isLastSegment);
    if (segmentPath.length === 0) {
      return null;
    }
    // Avoid duplicating the starting point of each segment
    if (i > 0) {
      segmentPath.shift();
    }
    fullPath = fullPath.concat(segmentPath);
  }

  return fullPath;
}

