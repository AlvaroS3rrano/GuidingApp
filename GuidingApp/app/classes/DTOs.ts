/**
 * Result of a search query, combining node data, its associated map data, and a relevance score.
 */
export interface NodeMapDataSearchResultDTO {
  /** Node information that matched the search query */
  node: NodeDTO;

  /** Map data associated with the matched node */
  mapData: MapDataDTO;

  /** Number of keyword matches in node name and map name */
  score: number;
}

/**
 * Represents a named matrix block as returned by the API
 */
export interface NamedMatrixDTO {
  /** Unique floor identifier for this matrix */
  floorNumber: number;

  /** Human-readable name of the matrix block */
  name: string;

  /** 2D integer array representing the matrix contents */
  matrix: number[][];
}

/**
 * Node information as returned by the API
 */
export interface NodeDTO {
  /** Unique identifier for this node */
  id: number;

  /** Human-readable name of the node */
  name: string;

  /** Beacon identifier associated with this node */
  beaconId: string;

  /** Floor number where this node resides */
  floorNumber: number;

  /** Whether this node represents an exit point */
  exit: boolean;

  /** Whether this node represents an entrance point */
  entrance: boolean;

  /** X-coordinate (e.g., for rendering on a map) */
  x: number;

  /** Y-coordinate (e.g., for rendering on a map) */
  y: number;

  /** Optional 2D area definition for zone visualization */
  area: number[][];
}

/**
 * Edge connecting two nodes, with metadata
 */
export interface EdgeDTO {
  /** Unique identifier for this edge */
  id: number;

  /** Weight or cost associated with traversing this edge */
  weight: number;

  /** Optional comment or description for this edge */
  comment: string;

  /** Source node of the edge */
  fromNode: NodeDTO;

  /** Destination node of the edge */
  toNode: NodeDTO;
}

/**
 * Full map data payload as returned by the API
 */
export interface MapDataDTO {
  /** Unique identifier for the map */
  id: number;

  /** Human-readable name of the map */
  name: string;

  /** North‐reference angle for map orientation */
  northAngle: number;

  /** Geographic latitude of the map origin */
  latitude: number;

  /** Geographic longitude of the map origin */
  longitude: number;

  /** List of named matrix blocks (each representing a floor) */
  matrices: NamedMatrixDTO[];

  /** All nodes present on this map */
  nodes: NodeDTO[];

  /** All edges connecting nodes on this map */
  edges: EdgeDTO[];
}

/**
 * Path between two nodes, used for routing calculations
 */
export interface Path {
  /** Starting node of the path */
  origin: NodeDTO;

  /** Ending node of the path */
  destination: NodeDTO;
}

/**
 * Get the 2D matrix for a specific floor number.
 *
 * @param mapData    the full MapDataDTO payload
 * @param floor      the floorNumber you want
 * @returns          the matrix for that floor
 * @throws           if no matrix block exists for the given floor
 */
export function getMatrixForFloor(
  mapData: MapDataDTO,
  floor: number
): number[][] {
  const block = mapData.matrices.find(m => m.floorNumber === floor);
  if (!block) {
    throw new Error(`No matrix found for floor ${floor}`);
  }
  return block.matrix;
}
