// nodeService.ts
import axios from 'axios';
import { NodeDTO } from "@/app/classes/DTOs";

const API_BASE_URL = 'http://192.168.1.55:8080/api/nodes';

export class NodeService {
  // Obtiene todos los nodos
  static async getAllNodes(): Promise<NodeDTO[]> {
    try {
      const response = await axios.get<NodeDTO[]>(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all nodes:', error);
      throw error;
    }
  }

  // Obtiene un nodo específico por ID
  static async getNodeById(id: number): Promise<NodeDTO> {
    try {
      const response = await axios.get<NodeDTO>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching node with id ${id}:`, error);
      throw error;
    }
  }

  // Obtiene un nodo por beaconId
  static async getNodeByBeaconId(beaconId: string): Promise<NodeDTO> {
    try {
      const response = await axios.get<NodeDTO>(`${API_BASE_URL}/beacon/${beaconId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching node with beaconId ${beaconId}:`, error);
      throw error;
    }
  }

}
