/**
 * Represents a named matrix block as returned by the API
 */
export interface NamedMatrixDTO {
  /** Unique floor identifier for this matrix */
  floorNumber: number;

  /** Human-readable name of the matrix block */
  name: string;

  /** 2D integer array representing the matrix contents */
  data: number[][];
}

/**
 * Node information as returned by the API
 */
export interface NodeDTO {
  id: number;
  name: string;
  beaconId: string;

  /** Floor number where this node resides */
  floorNumber: number;

  /** Coordinates (e.g., for rendering) */
  x: number;
  y: number;

  /** Optional area matrix for zone visualization */
  area: number[][];
}

/**
 * Edge connecting two nodes, with metadata
 */
export interface EdgeDTO {
  id: number;
  weight: number;
  comment: string;
  fromNode: NodeDTO;
  toNode: NodeDTO;
}

/**
 * Full map data payload as returned by the API
 */
export interface MapDataDTO {
  id: number;
  name: string;
  northAngle: number;

  /** List of named matrix blocks (floors) */
  matrices: NamedMatrixDTO[];

  /** All nodes in the map */
  nodes: NodeDTO[];

  /** All edges in the map */
  edges: EdgeDTO[];
}

/**
 * Path between two nodes, for routing
 */
export interface Path {
  origin: NodeDTO;
  destination: NodeDTO;
}
