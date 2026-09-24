import { getOccupancyLevel } from '../../config/app';
import type { ForecastPoint, OccupancySnapshot } from '../../types/domain';

export function occupancyColor(percent: number) {
  const tone = getOccupancyLevel(percent).tone;
  if (tone === 'success') return '#2f7f60';
  if (tone === 'warning') return '#c07a23';
  if (tone === 'danger') return '#b43b4d';
  return '#8a94a6'; // neutral
}

export function occupancyAtMinute(current: OccupancySnapshot, forecast: ForecastPoint[], minute: number) {
  if (minute <= 0) return {
    percent: current.percent,
    lowerBound: current.percent,
    upperBound: current.percent,
    confidence: current.confidence,
    source: 'current' as const,
  };
  const exact = forecast.find((point) => point.horizonMinutes === minute);
  const nearest = exact ?? [...forecast].sort((a, b) => Math.abs(a.horizonMinutes - minute) - Math.abs(b.horizonMinutes - minute))[0];
  if (!nearest) return {
    percent: current.percent,
    lowerBound: current.percent,
    upperBound: current.percent,
    confidence: current.confidence,
    source: 'current' as const,
  };
  return {
    percent: nearest.predictedPercent,
    lowerBound: nearest.lowerBound,
    upperBound: nearest.upperBound,
    confidence: nearest.confidence,
    source: 'forecast' as const,
  };
}

export function formatRelativeTime(iso: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `vor ${seconds} Sek.`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  return `vor ${Math.floor(minutes / 60)} Std.`;
}
