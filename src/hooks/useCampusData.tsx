import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { APP_CONFIG } from '../config/app';
import { dataProvider } from '../data';
import type { CampusDataBundle, OccupancySnapshot } from '../types/domain';

interface CampusDataState {
  data: CampusDataBundle | null;
  loading: boolean;
  error: string | null;
  online: boolean;
  refresh: () => Promise<void>;
}

const CampusDataContext = createContext<CampusDataState | null>(null);

async function loadBundle(currentOverride?: OccupancySnapshot): Promise<CampusDataBundle> {
  const current = currentOverride ?? await dataProvider.getCurrentOccupancy();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const minutesSinceDayStart = Math.max(180, Math.ceil((Date.now() - dayStart.getTime()) / 60_000));
  const [historyResult, forecastResult, sensorResult, analyticsResult, modelResult] = await Promise.allSettled([
    dataProvider.getOccupancyHistory(minutesSinceDayStart),
    dataProvider.getForecast(),
    dataProvider.getSensorStatus(),
    dataProvider.getAnalytics(),
    dataProvider.getModelInfo(),
  ]);

  const history = historyResult.status === 'fulfilled' && historyResult.value.length
    ? historyResult.value
    : (current.percent >= 0 ? [{ timestamp: current.capturedAt, percent: current.percent, typicalPercent: current.percent, rollingAverage: current.percent }] : []);
  const forecast = forecastResult.status === 'fulfilled' ? forecastResult.value : [];
  const sensor = sensorResult.status === 'fulfilled'
    ? sensorResult.value
    : {
        state: 'offline' as const,
        lastSeenAt: current.capturedAt,
        latencyMs: null,
        realtimeConnected: false,
        supabaseConnected: dataProvider.mode === 'live',
        message: 'Sensorstatus momentan nicht verfügbar',
      };
  const analytics = analyticsResult.status === 'fulfilled'
    ? analyticsResult.value
    : { hourlyProfile: [], weekdayProfile: [], heatmap: [], completeness: 0, missingRate: 100, peakHour: 0, quietHour: 0 };
  const model = modelResult.status === 'fulfilled'
    ? modelResult.value
    : {
        available: false,
        modelName: 'Modellstatus nicht verfügbar',
        version: '—',
        trainedAt: null,
        trainingWindow: '—',
        metrics: { mae: null, rmse: null, smape: null, r2: null, intervalCoverage: null },
        features: [],
        demoMetrics: false,
      };
  return { mode: dataProvider.mode, current, history, forecast, sensor, analytics, model };
}

export function CampusDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CampusDataBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(() => navigator.onLine);

  const refresh = async () => {
    try {
      const bundle = await loadBundle();
      setData(bundle);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), APP_CONFIG.refreshIntervalMs * 4);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!dataProvider.subscribeToOccupancy) return undefined;
    return dataProvider.subscribeToOccupancy((snapshot) => {
      setData((previous) => previous ? { ...previous, current: snapshot } : previous);
    });
  }, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const value = useMemo(() => ({ data, loading, error, online, refresh }), [data, loading, error, online]);
  return <CampusDataContext.Provider value={value}>{children}</CampusDataContext.Provider>;
}

export function useCampusData() {
  const context = useContext(CampusDataContext);
  if (!context) throw new Error('useCampusData must be used within CampusDataProvider');
  return context;
}
