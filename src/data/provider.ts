import type {
  AnalyticsBundle,
  DataMode,
  ForecastPoint,
  ModelInfo,
  OccupancyHistoryPoint,
  OccupancySnapshot,
  SensorStatus,
} from '../types/domain';

export interface DataProvider {
  readonly mode: DataMode;
  getCurrentOccupancy(): Promise<OccupancySnapshot>;
  getOccupancyHistory(minutes?: number): Promise<OccupancyHistoryPoint[]>;
  getForecast(): Promise<ForecastPoint[]>;
  getSensorStatus(): Promise<SensorStatus>;
  getAnalytics(): Promise<AnalyticsBundle>;
  getModelInfo(): Promise<ModelInfo>;
  subscribeToOccupancy?(onUpdate: (snapshot: OccupancySnapshot) => void): () => void;
}
