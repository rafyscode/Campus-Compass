import { useTranslation } from '../i18n/context';
import { Activity, Clock, Radio, Smartphone } from 'lucide-react';
import { OccupancyTimeline } from '../components/charts/OccupancyTimeline';
import { DataSourceBadge } from '../components/dashboard/DataSourceBadge';
import { MetricCard } from '../components/dashboard/MetricCard';
import { OccupancyGauge } from '../components/dashboard/OccupancyGauge';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { useCampusData } from '../hooks/useCampusData';
import type { TrendDirection } from '../types/domain';

export default function LivePage() {
  const { t } = useTranslation();
  const { data, loading, error, refresh } = useCampusData();
  if (loading || !data) return <div className="content"><LoadingSkeleton /></div>;
  if (error) return <div className="content"><ErrorState message={error} onRetry={() => void refresh()} /></div>;
  const isOffline = data.current.percent < 0;
  const currentPercent = isOffline ? (data.history.at(-1)?.percent ?? 0) : data.current.percent;
  // If we have at least 4 points (15 mins), use that. Otherwise use the oldest point we have. If no points, use typical.
  const fifteenAgo = data.history.length >= 4 
    ? data.history.at(-4)!.percent 
    : data.history.length > 0 
      ? data.history[0].percent 
      : (data.history.at(-1)?.typicalPercent ?? currentPercent);
  const delta = isOffline ? 0 : data.current.percent - fifteenAgo;
  const trend: TrendDirection = delta > 2 ? 'rising' : delta < -2 ? 'falling' : 'stable';
  const typicalNow = data.history.at(-1)?.typicalPercent ?? currentPercent;
  const typicalDelta = isOffline ? 0 : data.current.percent - typicalNow;

  return (
    <div className="content page-stack">
      <PageHeader eyebrow={t("Live Auslastung")} title={t("Was passiert gerade?")} description={t("Aktueller Auslastungswert, Trend, Datenalter und Sensorzustand auf einen Blick.")} action={<DataSourceBadge mode={data.mode} />} />
      <Card className="card-pad"><OccupancyGauge snapshot={data.current} trend={trend} delta15={delta} /></Card>
      <div className="grid metrics-grid">
        <MetricCard label={t("Geschätzte Personen")} value={data.current.count?.toString() ?? '—'} detail={t("Aktuell geschätzt")} icon={Smartphone} />
        <MetricCard label={t("Änderungsrate")} value={isOffline ? '—' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} %`} detail={t("gegenüber vor 15 Minuten")} icon={Activity} />
        <MetricCard label={t("Typischer Zeitpunkt")} value={isOffline ? '—' : `${Math.abs(typicalDelta).toFixed(0)} %`} detail={isOffline ? '—' : typicalDelta < 0 ? t("ruhiger als typisch") : t("voller als typisch")} icon={Clock} />
        <MetricCard label={t("Sensor")} value={data.sensor.state === 'online' ? 'Online' : data.sensor.state === 'warning' ? 'Stale' : 'Offline'} detail={data.sensor.message} icon={Radio} />
      </div>
      <Card className="chart-card">
        <div className="chart-header"><div><span className="card-title">{t("Heute")}</span><h3>{t("Auslastungsverlauf")}</h3><p>{t("Typische Referenzlinie wird zusammen mit dem beobachteten Live-Verlauf dargestellt.")}</p></div></div>
        <OccupancyTimeline history={data.history} forecast={[]} />
      </Card>
      <Card className="card-pad">
        <div className="section-heading"><div><h2>{t("Live-Vertrauen")}</h2><p>{t("Ein Live-Wert ist nur so gut wie seine Frische und Sensorqualität.")}</p></div></div>
        <div className="grid grid-3" style={{ marginTop: 18 }}>
          <div className="inline-stat"><strong>{Math.round(data.current.confidence * 100)} %</strong><span>{t("Messkonfidenz")}</span></div>
          <div className="inline-stat"><strong>{data.sensor.latencyMs ?? '—'} ms</strong><span>{t("API-/Sensorlatenz")}</span></div>
          <div className="inline-stat"><strong>{data.sensor.realtimeConnected ? 'Aktiv' : 'Inaktiv'}</strong><span>{t("Realtime-Kanal")}</span></div>
        </div>
      </Card>
    </div>
  );
}
