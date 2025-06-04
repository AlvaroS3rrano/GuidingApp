import { EdgeDTO, MapDataDTO, NodeDTO } from '@/app/classes/DTOs';

/**
 * Heuristic function: returns the Euclidean distance between two nodes by ID.
 * If either node has no (x, y), returns 0 so that A* behaves like Dijkstra.
 */
function heuristic(
  nodeMap: Record<number, NodeDTO>,
  aId: number,
  bId: number
): number {
  const a = nodeMap[aId];
  const b = nodeMap[bId];

  // If both nodes have numeric x and y, compute Euclidean distance
  if (
    a !== undefined &&
    b !== undefined &&
    typeof a.x === "number" &&
    typeof a.y === "number" &&
    typeof b.x === "number" &&
    typeof b.y === "number"
  ) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  // Otherwise, return 0 (so A* reduces to Dijkstra)
  return 0;
}

/**
 * findPathAStar:
 *   - mapdata: your MapDataDTO (contains .nodes and .edges)
 *   - startId: ID of the starting node
 *   - endId:   ID of the target node
 *
 * Returns an array [startId, ..., endId] representing the optimal path,
 * or [] if no path exists.
 */
export function findPathAStar(
  mapdata: MapDataDTO,
  startId: number,
  endId: number
): number[] {
  // 1) Build a lookup dictionary so we can reference NodeDTO by its ID in O(1).
  const nodeMap: Record<number, NodeDTO> = {};
  for (const node of mapdata.nodes) {
    nodeMap[node.id] = node;
  }

  // 2) gScore[id] = lowest known cost from startId to this node ID.
  //    fScore[id] = gScore[id] + heuristic(id, endId).
  const gScore: Record<number, number> = {};
  const fScore: Record<number, number> = {};
  const previous: Record<number, number | null> = {};

  // Initialize all scores to Infinity and previous to null.
  for (const node of mapdata.nodes) {
    gScore[node.id] = Infinity;
    fScore[node.id] = Infinity;
    previous[node.id] = null;
  }
  // For the start node:
  gScore[startId] = 0;
  fScore[startId] = heuristic(nodeMap, startId, endId);

  // 3) openSet holds the set of node IDs that are pending exploration.
  const openSet = new Set<number>();
  openSet.add(startId);

  // 4) Main loop: while there are nodes to explore:
  while (openSet.size > 0) {
    // 4.1) Choose currentId = the node in openSet with the lowest fScore.
    let currentId: number | null = null;
    for (const id of openSet) {
      if (
        currentId === null ||
        fScore[id] < fScore[currentId]
      ) {
        currentId = id;
      }
    }
    if (currentId === null) break; // Should not happen, but just in case

    // 4.2) If we reached the end node, reconstruct the path.
    if (currentId === endId) {
      const path: number[] = [];
      let u: number | null = endId;
      while (u !== null) {
        path.unshift(u);
        u = previous[u];
      }
      return path;
    }

    // 4.3) Remove currentId from openSet (we’re about to expand it).
    openSet.delete(currentId);

    // 4.4) For each outgoing edge from currentId:
    for (const edge of mapdata.edges) {
      if (edge.fromNode.id !== currentId) continue;

      const neighborId = edge.toNode.id;
      const tentativeG = gScore[currentId] + edge.weight;

      // If this path to neighborId is better than any previous one:
      if (tentativeG < gScore[neighborId]) {
        previous[neighborId] = currentId;
        gScore[neighborId] = tentativeG;
        fScore[neighborId] =
          tentativeG + heuristic(nodeMap, neighborId, endId);

        // If neighborId wasn’t already in openSet, add it.
        if (!openSet.has(neighborId)) {
          openSet.add(neighborId);
        }
      }
    }
  }

  // 5) If we exit the loop without reaching endId, there is no path.
  return [];
}
