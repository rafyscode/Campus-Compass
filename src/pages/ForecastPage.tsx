import { Clock3, Gauge, Mountain, TrendingDown } from 'lucide-react';
import { Heatmap } from '../components/charts/Heatmap';
import { OccupancyTimeline } from '../components/charts/OccupancyTimeline';
import { BestTimeCard, getBestWindow } from '../components/dashboard/BestTimeCard';
import { DataSourceBadge } from '../components/dashboard/DataSourceBadge';
import { MetricCard } from '../components/dashboard/MetricCard';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { useCampusData } from '../hooks/useCampusData';

function forecastAt(data: { horizonMinutes: number; predictedPercent: number; confidence: number }[], target: number) {
  return data.find((point) => point.horizonMinutes >= target - 15 && point.horizonMinutes <= target + 15);
}

export default function ForecastPage() {
  const { data, loading, error, refresh } = useCampusData();
  if (loading || !data) return <div className="content"><LoadingSkeleton /></div>;
  if (error) return <div className="content"><ErrorState message={error} onRetry={() => void refresh()} /></div>;
  const isOffline = data.sensor.state === 'offline';
  const displayForecast = isOffline ? [] : data.forecast;
  
  const f15 = forecastAt(displayForecast, 15);
  const f60 = forecastAt(displayForecast, 60);
  const f120 = forecastAt(displayForecast, 120);

  const peak = displayForecast.length ? displayForecast.reduce((a, b) => a.predictedPercent > b.predictedPercent ? a : b) : null;
  const low = displayForecast.length ? displayForecast.reduce((a, b) => a.predictedPercent < b.predictedPercent ? a : b) : null;
  const best = getBestWindow(displayForecast);

  return (
    <div className="content page-stack">
      <PageHeader eyebrow="Forecast" title="Auslastungsprognose" description="Mehrere Vorhersagehorizonte, Unsicherheitsintervalle und eine konkrete Besuchsempfehlung." action={<DataSourceBadge mode={data.mode} />} />
      <div className="grid grid-main">
        <Card className="chart-card" style={{ minHeight: 430 }}>
          <div className="chart-header"><div><span className="card-title">Forecast Horizon · 0–120 min</span><h3>Auslastungsprognose (nächste 2 Stunden)</h3><p>Das Konfidenzband visualisiert die zu erwartende Abweichung basierend auf historischen Schwankungen.</p></div></div>
          <OccupancyTimeline history={data.history} forecast={displayForecast} />
        </Card>
        <Card><BestTimeCard current={data.current} forecast={displayForecast} /></Card>
      </div>
      <div className="grid metrics-grid">
        <MetricCard label="+15 Minuten" value={f15 ? `${f15.predictedPercent.toFixed(0)} %` : '—'} detail={f15 ? `${Math.round(f15.confidence * 100)} % Konfidenz` : 'kein Forecast'} icon={Clock3} />
        <MetricCard label="+60 Minuten" value={f60 ? `${f60.predictedPercent.toFixed(0)} %` : '—'} detail={f60 ? `${Math.round(f60.confidence * 100)} % Konfidenz` : 'kein Forecast'} icon={Gauge} />
        <MetricCard label="+120 Minuten" value={f120 ? `${f120.predictedPercent.toFixed(0)} %` : '—'} detail={f120 ? `${Math.round(f120.confidence * 100)} % Konfidenz` : 'kein Forecast'} icon={Mountain} />
        <MetricCard label="Bestes Fenster" value={best ? `${best.percent.toFixed(0)} %` : '—'} detail="niedrigste erwartete Auslastung" icon={TrendingDown} />
      </div>
      <div className="grid grid-2">
        <Card className="card-pad"><span className="card-title">Erwarteter Peak</span><div className="metric-value">{peak ? `${peak.predictedPercent.toFixed(0)} %` : '—'}</div><div className="metric-detail">höchste erwartete Auslastung in den kommenden 2 Stunden</div></Card>
        <Card className="card-pad"><span className="card-title">Beste Gelegenheit</span><div className="metric-value">{low ? `${low.predictedPercent.toFixed(0)} %` : '—'}</div><div className="metric-detail">ruhigster prognostizierter Zeitpunkt im Forecast-Fenster</div></Card>
      </div>
      <Card className="heatmap-card"><div className="section-heading"><div><h2>Typische Woche</h2><p>Durchschnittliche Auslastung basierend auf historischen Daten. Dunklere Felder markieren die Hauptstoßzeiten.</p></div></div><Heatmap cells={data.analytics.heatmap} /></Card>
    </div>
  );
}
