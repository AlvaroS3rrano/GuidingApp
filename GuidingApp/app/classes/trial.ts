import axios from 'axios';

// Define las interfaces según los DTO de la API

export interface NodeDTO {
  id: number;
  name: string;
  beaconId: string;
  x: number;
  y: number;
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

// Configura la URL base de tu API (ajústala según tu entorno)
const API_BASE_URL = 'http://TU_API_URL/api/mapdata';

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
