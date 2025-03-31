export interface NodeDTO {
  id: number;
  name: string;
  beaconId: string;
  x: number;
  y: number;
  comment: string;
  area: number[][];
}

export interface EdgeDTO {
  id: number;
  fromNode: NodeDTO;
  toNode: NodeDTO;
}

export interface MapDataDTO {
  id: number;
  name: string;
  northAngle: number;
  matrix: number[][];
  nodes: NodeDTO[];
  edges: EdgeDTO[];
}
