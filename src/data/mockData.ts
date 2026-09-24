import { APP_CONFIG } from '../config/app';
import type {
  AnalyticsBundle,
  ForecastPoint,
  OccupancyHistoryPoint,
  OccupancySnapshot,
} from '../types/domain';

function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function noise(seed: string, amplitude = 1): number {
  let x = hash32(seed);
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (((x >>> 0) / 4294967295) * 2 - 1) * amplitude;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function gaussian(hour: number, center: number, width: number, amplitude: number): number {
  const d = (hour - center) / width;
  return amplitude * Math.exp(-0.5 * d * d);
}

export function typicalOccupancyAt(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  const weekday = date.getDay();
  const weekendFactor = weekday === 0 || weekday === 6 ? 0.33 : 1;
  const baseline = 10 + gaussian(hour, 10.3, 1.7, 15) + gaussian(hour, 12.65, 1.05, 64) + gaussian(hour, 15.2, 1.7, 18);
  const closingDrop = hour > 16.5 ? Math.max(0.15, 1 - (hour - 16.5) * 0.32) : 1;
  const earlyGate = hour < 8 ? 0.35 : 1;
  return clamp(baseline * weekendFactor * closingDrop * earlyGate, 3, 95);
}

export function occupancyAt(date: Date): number {
  const bucket = Math.floor(date.getTime() / (5 * 60_000));
  const dailySeed = date.toISOString().slice(0, 10);
  const wave = Math.sin(bucket * 0.59) * 2.7 + Math.sin(bucket * 0.17 + 1.2) * 1.8;
  const n = noise(`${dailySeed}:${bucket}`, 2.8);
  return clamp(typicalOccupancyAt(date) + wave + n, 2, 98);
}

function rounded(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function createCurrentSnapshot(now = new Date()): OccupancySnapshot {
  const capturedAt = new Date(now.getTime() - 18_000);
  const percent = rounded(occupancyAt(capturedAt));
  return {
    capturedAt: capturedAt.toISOString(),
    count: Math.round((percent / 100) * APP_CONFIG.capacity),
    percent,
    capacity: APP_CONFIG.capacity,
    confidence: 0.96,
    source: 'demo',
  };
}

export function createHistory(now = new Date(), minutes = 180): OccupancyHistoryPoint[] {
  const points: OccupancyHistoryPoint[] = [];
  const values: number[] = [];
  for (let ago = minutes; ago >= 0; ago -= 5) {
    const date = new Date(now.getTime() - ago * 60_000);
    const percent = rounded(occupancyAt(date));
    values.push(percent);
    const slice = values.slice(-3);
    points.push({
      timestamp: date.toISOString(),
      percent,
      typicalPercent: rounded(typicalOccupancyAt(date)),
      rollingAverage: rounded(slice.reduce((sum, value) => sum + value, 0) / slice.length),
    });
  }
  return points;
}

export function createForecast(now = new Date()): ForecastPoint[] {
  const generatedAt = now.toISOString();
  const horizons = Array.from({ length: 25 }, (_, index) => index * 5).filter((value) => value > 0);
  return horizons.map((horizon) => {
    const target = new Date(now.getTime() + horizon * 60_000);
    const predicted = clamp(
      typicalOccupancyAt(target)
      + Math.sin(Math.floor(now.getTime() / 300_000) * 0.17 + horizon * 0.07) * 2.4,
      2,
      98,
    );
    const uncertainty = 4.2 + horizon * 0.045;
    return {
      generatedAt,
      targetAt: target.toISOString(),
      horizonMinutes: horizon,
      predictedPercent: rounded(predicted),
      lowerBound: rounded(clamp(predicted - uncertainty)),
      upperBound: rounded(clamp(predicted + uncertainty)),
      confidence: rounded(clamp(0.94 - horizon * 0.0011, 0.72, 0.96), 2),
    };
  });
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

export function createAnalytics(): AnalyticsBundle {
  const hourlyProfile = Array.from({ length: 11 }, (_, i) => 8 + i).map((hour) => {
    const sample = new Date('2026-09-09T00:00:00');
    sample.setHours(hour, 0, 0, 0);
    const mean = typicalOccupancyAt(sample);
    return { hour, mean: rounded(mean), median: rounded(mean - 1.8 + noise(`median:${hour}`, 1.5)) };
  });
  const weekdayProfile = WEEKDAYS.map((weekday, index) => ({
    weekday,
    mean: rounded(44 + noise(`weekday:${index}`, 5.4)),
  }));
  const heatmap = WEEKDAYS.flatMap((weekday, weekdayIndex) =>
    Array.from({ length: 11 }, (_, i) => 8 + i).map((hour) => {
      const sample = new Date(`2026-09-${7 + weekdayIndex}T00:00:00`);
      sample.setHours(hour, 0, 0, 0);
      return { weekday, hour, percent: rounded(clamp(typicalOccupancyAt(sample) + noise(`${weekday}:${hour}`, 4.2))) };
    }),
  );
  const peak = hourlyProfile.reduce((a, b) => (a.mean > b.mean ? a : b));
  const quiet = hourlyProfile.reduce((a, b) => (a.mean < b.mean ? a : b));
  return {
    hourlyProfile,
    weekdayProfile,
    heatmap,
    completeness: 99.4,
    missingRate: 0.6,
    peakHour: peak.hour,
    quietHour: quiet.hour,
  };
}
