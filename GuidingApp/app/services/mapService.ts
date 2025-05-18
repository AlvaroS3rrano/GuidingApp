// mapService.ts
import axios from 'axios';
import { EdgeDTO, MapDataDTO, NodeDTO } from "@/app/classes/DTOs";
import { COMP_IP } from '../constants/consts';

const apiClient = axios.create({
  baseURL: `https://${COMP_IP}/api/mapdata`,
});

export class MapService {
  static async getAllMapData(): Promise<MapDataDTO[]> {
    try {
      const res = await apiClient.get<MapDataDTO[]>('/');
      return res.data;
    } catch (e) {
      console.error('Error fetching all MapData:', e);
      throw e;
    }
  }

  static async getMapDataById(id: number): Promise<MapDataDTO> {
    try {
      const res = await apiClient.get<MapDataDTO>(`/${id}`);
      return res.data;
    } catch (e) {
      console.error(`Error fetching MapData ${id}:`, e);
      throw e;
    }
  }

  static async getMapDataByNodeId(beaconId: string): Promise<MapDataDTO> {
    try {
      const url = `https://${COMP_IP}/api/nodes/${beaconId}/mapdata`;
      const res = await axios.get<MapDataDTO>(url);
      return res.data;
    } catch (e) {
      console.error(`Error fetching MapData for beacon ${beaconId}:`, e);
      throw e;
    }
  }
}
