import type { DataProvider } from './provider';
import { createAnalytics, createCurrentSnapshot, createForecast, createHistory } from './mockData';

export class MockDataProvider implements DataProvider {
  readonly mode = 'demo' as const;

  async getCurrentOccupancy() {
    return createCurrentSnapshot();
  }

  async getOccupancyHistory(minutes = 180) {
    return createHistory(new Date(), minutes);
  }

  async getForecast() {
    return createForecast();
  }

  async getSensorStatus() {
    const current = createCurrentSnapshot();
    return {
      state: 'online' as const,
      lastSeenAt: current.capturedAt,
      latencyMs: 84,
      realtimeConnected: true,
      supabaseConnected: false,
      message: 'Simulierter Sensorstream für Phase 1',
    };
  }

  async getAnalytics() {
    return createAnalytics();
  }

  async getModelInfo() {
    return {
      available: true,
      modelName: 'Demo Forecast Ensemble',
      version: 'demo-0.3',
      trainedAt: null,
      trainingWindow: 'Simulierte historische Tagesprofile',
      metrics: {
        mae: 4.8,
        rmse: 6.2,
        smape: 8.7,
        r2: 0.84,
        intervalCoverage: 0.91,
      },
      features: ['Uhrzeit', 'Wochentag', 'historische Lags', 'Rolling Mean', 'Rolling Std', 'Trend'],
      demoMetrics: true,
    };
  }

  subscribeToOccupancy(onUpdate: Parameters<NonNullable<DataProvider['subscribeToOccupancy']>>[0]) {
    const timer = window.setInterval(() => onUpdate(createCurrentSnapshot()), 15_000);
    return () => window.clearInterval(timer);
  }
}
