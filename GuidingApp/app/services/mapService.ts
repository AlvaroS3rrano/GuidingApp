// mapService.ts
import axios from 'axios';
import { EdgeDTO, MapDataDTO, NodeDTO} from "@/app/classes/DTOs"
import { COMP_IP } from '../constants/consts';

const API_BASE_URL = 'http://'+COMP_IP+':8080/api/mapdata';

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

  // (Opcional) Obtiene el MapData asociado a un Node, usando el endpoint del NodeRestController.
  static async getMapDataByNodeId(beaconId: string): Promise<MapDataDTO> {
    try {
      const response = await axios.get<MapDataDTO>(`http://${COMP_IP}:8080/api/nodes/${beaconId}/mapdata`);
      console.log("response data", response.data)
      return response.data;
    } catch (error) {
      console.error(`Error fetching MapData for node id ${beaconId}:`, error);
      throw error;
    }
  }
}

