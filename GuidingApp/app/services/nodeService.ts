// nodeService.ts
import axios from 'axios';
import { NodeDTO, NodeMapDataSearchResultDTO } from "@/app/classes/DTOs";
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

  static async searchNodes(query: string, limit: number = 5): Promise<NodeMapDataSearchResultDTO[]> {
    try {
      const response = await apiClient.get<NodeMapDataSearchResultDTO[]>('/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (e) {
      console.error(`Error searching nodes with query="${query}" and limit=${limit}:`, e);
      throw e;
    }
  }

  static async getExitNodesByMapDataId(mapDataId: number): Promise<NodeDTO[]> {
    try {
      const response = await apiClient.get<NodeDTO[]>(`/exits/${mapDataId}`);
      return response.data;
    } catch (e) {
      console.error(`Error fetching exit nodes for mapData ${mapDataId}:`, e);
      throw e;
    }
  }

  static async getEntranceNodesByMapDataId(mapDataId: number): Promise<NodeDTO[]> {
    try {
      const response = await apiClient.get<NodeDTO[]>(`/entrance/${mapDataId}`);
      return response.data;
    } catch (e) {
      console.error(`Error fetching entrance nodes for mapData ${mapDataId}:`, e);
      throw e;
    }
  }
}
