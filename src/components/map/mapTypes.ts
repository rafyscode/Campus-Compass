import type { CampusLayerKey, CampusVisualMode } from '../../data/campus';

export type CampusLayersState = Record<CampusLayerKey, boolean>;

export interface CameraTarget {
  id: number;
  position: [number, number, number];
  target: [number, number, number];
  instant?: boolean;
}

export interface CampusMapUiState {
  selectedBuildingId: string;
  hoveredBuildingId: string | null;
  forecastMinute: number;
  layers: CampusLayersState;
  visualMode: CampusVisualMode;
}
