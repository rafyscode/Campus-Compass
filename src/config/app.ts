import type { OccupancyLevel } from '../types/domain';

export const APP_CONFIG = {
  appName: 'Campus Compass',
  subtitle: 'Leuphana Universität Lüneburg',
  locationName: 'Mensa · Zentraler Campus',
  locationSlug: 'mensa_main',
  campusAddress: 'Universitätsallee 1, 21335 Lüneburg',
  capacity: 700,
  staleThresholdSeconds: 30,
  offlineThresholdSeconds: 60,
  refreshIntervalMs: 15_000,
  forecastHorizons: [15, 30, 60, 90, 120] as const,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildDate: typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : new Date().toISOString(),
  brand: {
    primary: '#7b0832',
    primaryDark: '#52051f',
    primaryLight: '#f1dfe6',
  },
  occupancyLevels: [
    { key: 'unknown', label: 'Unbekannt', min: -100, max: 0, tone: 'neutral' },
    { key: 'very-quiet', label: 'Sehr ruhig', min: 0, max: 25, tone: 'success' },
    { key: 'quiet', label: 'Ruhig', min: 25, max: 50, tone: 'success' },
    { key: 'moderate', label: 'Moderat', min: 50, max: 70, tone: 'warning' },
    { key: 'full', label: 'Voll', min: 70, max: 85, tone: 'danger' },
    { key: 'very-full', label: 'Sehr voll', min: 85, max: 101, tone: 'danger' },
  ] satisfies OccupancyLevel[],
} as const;

export function getOccupancyLevel(percent: number): OccupancyLevel {
  return APP_CONFIG.occupancyLevels.find((level) => percent >= level.min && percent < level.max)
    ?? APP_CONFIG.occupancyLevels[APP_CONFIG.occupancyLevels.length - 1];
}

export function occupancyToneClass(percent: number): string {
  const key = getOccupancyLevel(percent).tone;
  return `tone-${key}`;
}

declare const __BUILD_DATE__: string;
