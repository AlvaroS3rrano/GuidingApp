// mapService.ts
import axios from 'axios';
import { generateGeom, updateMatrixWithDoors, Door } from "@/app/classes/geometry";
import { MapData } from "@/app/classes/mapData";
import { Node } from "@/app/classes/node";
import { EdgeDTO, MapDataDTO, NodeDTO} from "@/app/classes/trial"

const API_BASE_URL = 'http://192.168.1.55:8080/api/mapdata';

export class MapService {
  // Obtiene todos los MapData
  static async getAllMapData(): Promise<MapDataDTO[]> {
    try {
      const response = await axios.get<MapDataDTO[]>(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all MapData:', error);
      throw error;
    }
  }

  // Obtiene un MapData específico por ID
  static async getMapDataById(id: number): Promise<MapDataDTO> {
    try {
      const response = await axios.get<MapDataDTO>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching MapData with id ${id}:`, error);
      throw error;
    }
  }
}

/*
// Define your nodes
const or = new Node(
  "d4fcb04a6573ea399df3adbf06f91b38",
  [{ x: 10, y: 0 }, { x: 15, y: 0 }, { x: 15, y: 5 }, { x: 10, y: 5 }],
  { x: 13, y: 2 }
);
const des = new Node(
  "15c210b9f1ea2e121131bba29e8cc90a",
  [{ x: 0, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
  { x: 3, y: 8 }
);
const cent = new Node(
  "530801241127a8aad378170fdbabbd17",
  [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 5 }, { x: 0, y: 5 }],
  { x: 5, y: 3 }
);

// Mapping for node selection; keys are labels for user convenience
const places: Record<string, Node> = {
  'Or': or,
  'Des': des,
  'Cent': cent,
};

// Generate the initial map grid using your geometry functions
let initialGrid: number[][] = generateGeom([
  { x: 0, y: 0 },
  { x: 15, y: 0 },
  { x: 15, y: 5 },
  { x: 10, y: 5 },
  { x: 10, y: 10 },
  { x: 0, y: 10 }
]);

const doors: Door[] = [
  [{ x: 15, y: 2 }, { x: 15, y: 3 }],
  [{ x: 10, y: 7 }, { x: 10, y: 8 }],
];

initialGrid = updateMatrixWithDoors(initialGrid, doors);

// Build the graph using the defined nodes
const graph = {
  nodes: [or, cent, des],
  edges: [
    { from: or.id, to: cent.id, weight: 5 },
    { from: des.id, to: cent.id, weight: 5 },
    { from: cent.id, to: des.id, weight: 5 },
    { from: cent.id, to: or.id, weight: 5 },
  ],
};

// Create the MapData instance
const mapData: MapData = {
  name: "Ground Floor",
  initialMap: initialGrid,
  graph: graph,
};

export { mapData, places };

*/
