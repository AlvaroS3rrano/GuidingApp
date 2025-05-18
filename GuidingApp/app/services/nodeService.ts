// nodeService.ts
import axios from 'axios';
import { NodeDTO } from "@/app/classes/DTOs";
import { COMP_IP } from '../constants/consts';

const apiClient = axios.create({ baseURL: `https://${COMP_IP}/api/nodes` });

export class NodeService {
  static async getAllNodes(): Promise<NodeDTO[]> {
    try {
      const response = await apiClient.get<NodeDTO[]>('/');
      return response.data;
    } catch (e) {
      console.error('Error fetching all nodes:', e);
      throw e;
    }
  }

  static async getNodeById(id: number): Promise<NodeDTO> {
    try {
      const response = await apiClient.get<NodeDTO>(`/${id}`);
      return response.data;
    } catch (e) {
      console.error(`Error fetching node ${id}:`, e);
      throw e;
    }
  }

  static async getNodeByBeaconId(beaconId: string): Promise<NodeDTO> {
    try {
      const response = await apiClient.get<NodeDTO>(`/beacon/${beaconId}`);
      console.log('Fetched node:', response.data);
      return response.data;
    } catch (e) {
      console.error(`Error fetching beacon ${beaconId}:`, e);
      throw e;
    }
  }
}
