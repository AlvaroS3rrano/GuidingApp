// globalBannerState.ts
import { MapDataDTO } from '../classes/DTOs';

export interface BannerState {
  popupShown: boolean;
  fallbackVisible: boolean;
  closestMap: MapDataDTO | null;
}

export const globalBannerState: BannerState = {
  popupShown: false,
  fallbackVisible: false,
  closestMap: null,
};
