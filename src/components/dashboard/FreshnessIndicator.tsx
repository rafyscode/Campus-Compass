import { APP_CONFIG } from '../../config/app';

export function formatRelativeAge(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `vor ${seconds} Sek.`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  return `vor ${Math.round(minutes / 60)} Std.`;
}

export function FreshnessIndicator({ timestamp }: { timestamp: string }) {
  const seconds = (Date.now() - new Date(timestamp).getTime()) / 1000;
  const state = seconds > APP_CONFIG.offlineThresholdSeconds ? 'offline' : seconds > APP_CONFIG.staleThresholdSeconds ? 'stale' : '';
  return <span className={`freshness ${state}`.trim()}>{state === 'offline' ? 'Offline' : `Aktualisiert ${formatRelativeAge(timestamp)}`}</span>;
}
