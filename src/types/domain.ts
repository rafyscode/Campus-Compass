export type DataMode = 'demo' | 'live';
export type OccupancyLevelKey = 'unknown' | 'very-quiet' | 'quiet' | 'moderate' | 'full' | 'very-full';
export type TrendDirection = 'rising' | 'stable' | 'falling';
export type SensorState = 'online' | 'warning' | 'offline';

export interface OccupancyLevel {
  key: OccupancyLevelKey;
  label: string;
  min: number;
  max: number;
  tone: 'success' | 'neutral' | 'warning' | 'danger';
}

export interface OccupancySnapshot {
  capturedAt: string;
  count: number | null;
  percent: number;
  capacity: number;
  confidence: number;
  source: DataMode;
}

export interface OccupancyHistoryPoint {
  timestamp: string;
  percent: number;
  typicalPercent: number;
  rollingAverage: number;
}

export interface ForecastPoint {
  generatedAt: string;
  targetAt: string;
  horizonMinutes: number;
  predictedPercent: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface SensorStatus {
  state: SensorState;
  lastSeenAt: string;
  latencyMs: number | null;
  realtimeConnected: boolean;
  supabaseConnected: boolean;
  message: string;
}

export interface HourlyProfilePoint {
  hour: number;
  mean: number;
  median: number;
}

export interface WeekdayProfilePoint {
  weekday: string;
  mean: number;
}

export interface HeatmapCell {
  weekday: string;
  hour: number;
  percent: number;
}

export interface AnalyticsBundle {
  hourlyProfile: HourlyProfilePoint[];
  weekdayProfile: WeekdayProfilePoint[];
  heatmap: HeatmapCell[];
  completeness: number;
  missingRate: number;
  peakHour: number;
  quietHour: number;
}

export interface ModelInfo {
  available: boolean;
  modelName: string;
  version: string;
  trainedAt: string | null;
  trainingWindow: string;
  metrics: {
    mae: number | null;
    rmse: number | null;
    smape: number | null;
    r2: number | null;
    intervalCoverage: number | null;
  };
  features: string[];
  demoMetrics: boolean;
}

export interface CampusDataBundle {
  mode: DataMode;
  current: OccupancySnapshot;
  history: OccupancyHistoryPoint[];
  forecast: ForecastPoint[];
  sensor: SensorStatus;
  analytics: AnalyticsBundle;
  model: ModelInfo;
}
