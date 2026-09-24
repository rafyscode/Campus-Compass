import { APP_CONFIG } from '../config/app';
import { supabase } from '../lib/supabase';
import type { DataProvider } from './provider';
import type { ForecastPoint, OccupancySnapshot } from '../types/domain';

function requireClient() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.');
  return supabase;
}

const DEVICES_PER_PERSON = 1.6;

function snapshotFromRow(row: Record<string, unknown>, capacity: number): OccupancySnapshot {
  const rawCount = row.device_count == null ? null : Number(row.device_count);
  const count = rawCount !== null ? Math.round(rawCount / DEVICES_PER_PERSON) : null;
  const percent = count !== null ? (count / capacity) * 100 : 0;
  return {
    capturedAt: String(row.created_at),
    count,
    percent,
    capacity,
    confidence: 1, // Number(row.confidence ?? 1),
    source: 'live',
  };
}

export class SupabaseDataProvider implements DataProvider {
  readonly mode = 'live' as const;
  private locationId: string | null = null;
  private capacity: number = APP_CONFIG.capacity;
  private realtimeConnected = false;

  private async getLocationId() {
    if (this.locationId) return this.locationId;
    const client = requireClient();
    const { data, error } = await client
      .from('locations')
      .select('id, max_capacity')
      .eq('id', APP_CONFIG.locationSlug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Standort '${APP_CONFIG.locationSlug}' ist in Supabase nicht konfiguriert.`);
    this.locationId = String(data.id);
    if (data.max_capacity) {
      this.capacity = Number(data.max_capacity);
    }
    return this.locationId;
  }

  async getCurrentOccupancy() {
    const client = requireClient();
    const locationId = await this.getLocationId();
    const { data, error } = await client
      .from('occupancy_logs')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Noch keine Live-Messung vorhanden.');
    
    const lastSeenAt = String(data.created_at);
    const ageSeconds = (Date.now() - new Date(lastSeenAt).getTime()) / 1000;
    const isOffline = ageSeconds > APP_CONFIG.offlineThresholdSeconds;
    
    const snapshot = snapshotFromRow(data, this.capacity);
    if (isOffline) {
      snapshot.count = null;
      snapshot.percent = -1;
      snapshot.confidence = 0;
    }
    return snapshot;
  }

  async getOccupancyHistory(minutes = 180) {
    const client = requireClient();
    const locationId = await this.getLocationId();
    const since = new Date(Date.now() - minutes * 60_000).toISOString();
    const { data, error } = await client
      .from('occupancy_logs')
      .select('created_at, device_count')
      .eq('location_id', locationId)
      .gte('created_at', since)
      .order('created_at', { ascending: true });
    if (error) throw error;
    
    const values = (data ?? []).map((row) => (Math.round(Number(row.device_count) / DEVICES_PER_PERSON) / this.capacity) * 100);
    return (data ?? []).map((row, index) => {
      const windowValues = values.slice(Math.max(0, index - 2), index + 1);
      const count = Math.round(Number(row.device_count) / DEVICES_PER_PERSON);
      const percent = (count / this.capacity) * 100;
      
      const d = new Date(row.created_at);
      const time = d.getHours() + d.getMinutes() / 60;
      let expectedCount = 35;
      expectedCount += 320 * Math.exp(-Math.pow(time - 12.5, 2) / 1.5);
      expectedCount += 180 * Math.exp(-Math.pow(time - 18.0, 2) / 2.0);
      let typicalPercent = (expectedCount / this.capacity) * 100;
      typicalPercent = Math.min(100, Math.max(0, typicalPercent));

      return {
        timestamp: String(row.created_at),
        percent,
        typicalPercent,
        rollingAverage: windowValues.reduce((sum, value) => sum + value, 0) / windowValues.length,
      };
    });
  }

  async getForecast() {
    const client = requireClient();
    const locationId = await this.getLocationId();
    const staleThreshold = new Date(Date.now() - 30 * 60_000).toISOString();
    const { data, error } = await client
      .from('ai_forecasts')
      .select('*')
      .eq('location_id', locationId)
      .gte('target_time', new Date().toISOString())
      .gte('generated_at', staleThreshold)
      .order('target_time', { ascending: true })
      .limit(48);
    if (!error && data && data.length > 0) {
      return data.map((row): ForecastPoint => {
        const generatedAt = new Date(String(row.generated_at));
        const targetAt = new Date(String(row.target_time));
        const horizonMinutes = Math.round((targetAt.getTime() - generatedAt.getTime()) / 60000);
        const predictedPercent = (Number(row.predicted_count) / this.capacity) * 100;
        
        const spread = 5 + (horizonMinutes / 120) * 15;
        const dynamicConfidence = Math.max(0.4, 0.95 - (horizonMinutes / 120) * 0.35);
        
        return {
          generatedAt: String(row.generated_at),
          targetAt: String(row.target_time),
          horizonMinutes,
          predictedPercent,
          lowerBound: Math.max(0, predictedPercent - spread),
          upperBound: Math.min(100, predictedPercent + spread),
          confidence: dynamicConfidence,
        };
      });
    }

    return [];
  }

  async getSensorStatus() {
    const client = requireClient();
    const locationId = await this.getLocationId();
    const start = performance.now();
    const { data } = await client
      .from('occupancy_logs')
      .select('created_at')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const latencyMs = Math.round(performance.now() - start);
    
    const lastSeenAt = data?.created_at ? String(data.created_at) : new Date(0).toISOString();
    const age = (Date.now() - new Date(lastSeenAt).getTime()) / 1000;
    const state = age > APP_CONFIG.offlineThresholdSeconds ? 'offline' : age > APP_CONFIG.staleThresholdSeconds ? 'warning' : 'online';
    return {
      state,
      lastSeenAt,
      latencyMs,
      realtimeConnected: this.realtimeConnected,
      supabaseConnected: true,
      message: state === 'online' ? 'Live-Daten aktiv' : 'Live-Daten sind veraltet',
    } as const;
  }

  async getAnalytics() {
    const client = requireClient();
    const locationId = await this.getLocationId();
    const since = new Date(Date.now() - 180 * 24 * 60 * 60_000).toISOString();
    const { data, error } = await client
      .from('occupancy_logs')
      .select('created_at, device_count')
      .eq('location_id', locationId)
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(10_000);
    if (error) throw error;
    const rows = data ?? [];
    if (!rows.length) {
      return { hourlyProfile: [], weekdayProfile: [], heatmap: [], completeness: 0, missingRate: 100, peakHour: 0, quietHour: 0 };
    }

    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
    const valuesByHour = new Map<number, number[]>();
    const valuesByWeekday = new Map<string, number[]>();
    const heat = new Map<string, number[]>();
    for (const row of rows) {
      const date = new Date(String(row.created_at));
      const hour = date.getHours();
      const weekdayIndex = (date.getDay() + 6) % 7;
      if (weekdayIndex > 4 || hour < 8 || hour > 22) continue;
      const weekday = weekdays[weekdayIndex];
      const count = Math.round(Number(row.device_count) / DEVICES_PER_PERSON);
      const value = (count / this.capacity) * 100;
      valuesByHour.set(hour, [...(valuesByHour.get(hour) ?? []), value]);
      valuesByWeekday.set(weekday, [...(valuesByWeekday.get(weekday) ?? []), value]);
      heat.set(`${weekday}-${hour}`, [...(heat.get(`${weekday}-${hour}`) ?? []), value]);
    }
    const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const median = (values: number[]) => {
      if (!values.length) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    };
    const hourlyProfile = Array.from({ length: 15 }, (_, index) => 8 + index).map((hour) => ({
      hour, mean: mean(valuesByHour.get(hour) ?? []), median: median(valuesByHour.get(hour) ?? []),
    }));
    const weekdayProfile = weekdays.map((weekday) => {
      const vals = valuesByWeekday.get(weekday);
      if (!vals || vals.length === 0) {
        const allVals = Array.from(valuesByWeekday.values()).flat();
        return { weekday, mean: mean(allVals) };
      }
      return { weekday, mean: mean(vals) };
    });
    const heatmap = weekdays.flatMap((weekday) => Array.from({ length: 15 }, (_, index) => {
      const hour = 8 + index;
      const vals = heat.get(`${weekday}-${hour}`);
      if (!vals || vals.length === 0) {
        const allValsForHour = valuesByHour.get(hour) ?? [];
        return { weekday, hour, percent: mean(allValsForHour) };
      }
      return { weekday, hour, percent: mean(vals) };
    }));
    const populatedHours = hourlyProfile.filter((point) => valuesByHour.get(point.hour)?.length);
    const peak = populatedHours.reduce((best, point) => point.mean > best.mean ? point : best, populatedHours[0] ?? { hour: 0, mean: 0, median: 0 });
    const quiet = populatedHours.reduce((best, point) => point.mean < best.mean ? point : best, populatedHours[0] ?? { hour: 0, mean: 0, median: 0 });
    const expectedSamples = 28 * 5 * 11 * 12;
    const completeness = Math.min(100, (rows.length / expectedSamples) * 100);
    return {
      hourlyProfile, weekdayProfile, heatmap, completeness, missingRate: Math.max(0, 100 - completeness), peakHour: peak.hour, quietHour: quiet.hour,
    };
  }

  async getModelInfo() {
    return {
      available: false,
      modelName: 'Noch kein produktives Modell',
      version: '—',
      trainedAt: null,
      trainingWindow: '—',
      metrics: { mae: null, rmse: null, smape: null, r2: null, intervalCoverage: null },
      features: [],
      demoMetrics: false,
    };
  }

  subscribeToOccupancy(onUpdate: (snapshot: OccupancySnapshot) => void) {
    const client = requireClient();
    let channel: ReturnType<typeof client.channel> | null = null;
    let cancelled = false;

    void this.getLocationId().then((locationId) => {
      if (cancelled) return;
      channel = client
        .channel(`public:occupancy_logs:${locationId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'occupancy_logs', filter: `location_id=eq.${locationId}` },
          (payload) => onUpdate(snapshotFromRow(payload.new, this.capacity)),
        )
        .subscribe((status) => {
          this.realtimeConnected = status === 'SUBSCRIBED';
        });
    }).catch(() => {
      this.realtimeConnected = false;
    });

    return () => {
      cancelled = true;
      this.realtimeConnected = false;
      if (channel) void client.removeChannel(channel);
    };
  }
}
