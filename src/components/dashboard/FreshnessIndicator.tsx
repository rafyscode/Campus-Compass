import { APP_CONFIG } from '../../config/app';
import { useTranslation } from '../../i18n/context';

export function formatRelativeAge(iso: string, t: (k: string, p?: any) => string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return t('vor {count} Sek.', { count: seconds });
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return t('vor {count} Min.', { count: minutes });
  return t('vor {count} Std.', { count: Math.round(minutes / 60) });
}

export function FreshnessIndicator({ timestamp }: { timestamp: string }) {
  const { t } = useTranslation();
  const seconds = (Date.now() - new Date(timestamp).getTime()) / 1000;
  const state = seconds > APP_CONFIG.offlineThresholdSeconds ? 'offline' : seconds > APP_CONFIG.staleThresholdSeconds ? 'stale' : '';
  return <span className={`freshness ${state}`.trim()}>{state === 'offline' ? t('Offline') : `${t('Aktualisiert')} ${formatRelativeAge(timestamp, t)}`}</span>;
}
