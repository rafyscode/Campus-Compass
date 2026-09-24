import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock3, Database, Gauge, LineChart, Radio, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OccupancyTimeline } from '../components/charts/OccupancyTimeline';
import { CampusPreview } from '../components/map/CampusPreview';
import { BestTimeCard, getBestWindow } from '../components/dashboard/BestTimeCard';
import { DataSourceBadge } from '../components/dashboard/DataSourceBadge';
import { FreshnessIndicator } from '../components/dashboard/FreshnessIndicator';
import { MetricCard } from '../components/dashboard/MetricCard';
import { TrendIndicator } from '../components/dashboard/TrendIndicator';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { SectionHeading } from '../components/ui/SectionHeading';
import { getOccupancyLevel } from '../config/app';
import { useCampusData } from '../hooks/useCampusData';
import type { TrendDirection } from '../types/domain';

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function closestHistoryDelta(history: { timestamp: string; percent: number }[], current: number, minutes = 15) {
  const target = Date.now() - minutes * 60_000;
  const point = history.reduce((best, item) => Math.abs(new Date(item.timestamp).getTime() - target) < Math.abs(new Date(best.timestamp).getTime() - target) ? item : best, history[0]);
  return point ? current - point.percent : 0;
}

export default function HomePage() {
  const { data, loading, error, refresh } = useCampusData();
  const reducedMotion = useReducedMotion();
  if (loading || !data) return <div className="content"><LoadingSkeleton /></div>;
  if (error) return <div className="content"><ErrorState message={error} onRetry={() => void refresh()} /></div>;

  const level = getOccupancyLevel(data.current.percent);
  const delta15 = data.current.percent >= 0 ? closestHistoryDelta(data.history, data.current.percent) : 0;
  const trend: TrendDirection = data.current.percent < 0 ? 'stable' : delta15 > 2 ? 'rising' : delta15 < -2 ? 'falling' : 'stable';
  const isOffline = data.sensor.state === 'offline';
  const displayForecast = isOffline ? [] : data.forecast;
  
  const f30 = displayForecast.find((point) => point.horizonMinutes >= 15 && point.horizonMinutes <= 45);
  const f60 = displayForecast.find((point) => point.horizonMinutes >= 45 && point.horizonMinutes <= 75);
  const best = getBestWindow(displayForecast);
  const todayPeak = [...data.history, ...displayForecast.map((point) => ({ percent: point.predictedPercent }))].reduce((max, point) => Math.max(max, point.percent), 0);

  return (
    <div className="content page-stack">
      <section className="hero">
        <motion.div className="hero-copy" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
          <span className="eyebrow"><Sparkles size={12} /> Smart Campus Projekt</span>
          <h1>Know before<br />you <span>go.</span></h1>
          <p className="hero-sub">Campus Compass verbindet Auslastung, Zeitreihen und Prognosen zu einer klaren Entscheidung: Wann ist ein guter Zeitpunkt für die Mensa?</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/live">Live-Ansicht öffnen <ArrowRight /></Link>
            <Link className="button button-ghost" to="/forecast">Prognose ansehen <LineChart /></Link>
          </div>
        </motion.div>

        <motion.div className="hero-visual" initial={reducedMotion ? false : { opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .6, delay: .08 }}>
          <div className="hero-orbit" aria-hidden="true" />
          <div className="hero-live-card">
            <div className="hero-live-head"><div><div className="card-label">Mensa · aktuell</div><div className="hero-live-title">Zentraler Campus</div></div><DataSourceBadge mode={data.mode} /></div>
            <div className="hero-percent">{data.current.percent >= 0 ? data.current.percent.toFixed(0) : '—'}<span>{data.current.percent >= 0 ? '%' : ''}</span></div>
            <div className="hero-status"><div><div className={`status-label tone-${level.tone}`}>{level.label}</div><div className="status-sub">{data.current.count ?? '—'} geschätzte Personen</div></div><TrendIndicator direction={trend} value={data.current.percent >= 0 ? delta15 : undefined} /></div>
            <div className="mini-divider" />
            <div className="best-window-inline"><div><strong>{best ? `${formatTime(best.start)}–${formatTime(best.end)}` : '—'}</strong><span>beste Zeit in den nächsten 2 Stunden</span></div><Clock3 size={19} style={{ color: 'var(--brand-primary)' }} /></div>
            <div style={{ marginTop: 22 }}><FreshnessIndicator timestamp={data.current.capturedAt} /></div>
          </div>
        </motion.div>
      </section>

      <CampusPreview current={data.current} />

      <section>
        <SectionHeading title="Auf einen Blick" description="Aktueller Zustand, nächste Entwicklung und Datenqualität." />
        <div className="grid metrics-grid" style={{ marginTop: 14 }}>
          <MetricCard label="Aktuell" value={data.current.percent >= 0 ? `${data.current.percent.toFixed(0)} %` : '—'} detail={level.label} icon={Gauge} />
          <MetricCard label="In 30 Minuten" value={f30 ? `${f30.predictedPercent.toFixed(0)} %` : '—'} detail={f30 ? `${Math.round(f30.confidence * 100)} % Forecast-Konfidenz` : 'Kein Forecast'} icon={Clock3} />
          <MetricCard label="In 60 Minuten" value={f60 ? `${f60.predictedPercent.toFixed(0)} %` : '—'} detail={f60 ? `${Math.round(f60.confidence * 100)} % Forecast-Konfidenz` : 'Kein Forecast'} icon={LineChart} />
          <MetricCard label="Tagesmaximum" value={`${todayPeak.toFixed(0)} %`} detail="Beobachtet + Forecast" icon={Users} />
        </div>
      </section>

      <section className="grid grid-main">
        <Card className="chart-card">
          <div className="chart-header"><div><span className="card-title">Zeitreihe</span><h3>Vergangenheit → Jetzt → Prognose</h3><p>Durchgezogen beobachtet, gestrichelt prognostiziert, Band = Unsicherheitsintervall.</p></div><div className="chart-legend"><span className="legend-item"><i className="legend-swatch" /> Beobachtet</span><span className="legend-item" style={{ color: 'var(--brand-primary)' }}><i className="legend-swatch legend-dashed" /> Prognose</span></div></div>
          <OccupancyTimeline history={data.history} forecast={data.forecast} compact />
        </Card>
        <Card><BestTimeCard current={data.current} forecast={data.forecast} /></Card>
      </section>

      <section>
        <SectionHeading title="Campus als Datenraum" description="Offene Geodaten zeigen den Campus in 3D. Die Mensa verbindet die Karte mit Auslastung und Prognosen." action={<Link className="section-link" to="/campus">3D Campus öffnen <ArrowRight size={13} /></Link>} />
        <Card className="card-pad" style={{ marginTop: 14, minHeight: 220, background: 'radial-gradient(circle at 80% 15%, rgba(123,8,50,.12), transparent 35%), var(--surface-elevated)' }}>
          <div className="grid grid-3" style={{ alignItems: 'center', minHeight: 165 }}>
            <div><span className="eyebrow"><Radio size={12} /> Sensor</span><h3 style={{ fontSize: 26, letterSpacing: '-.04em', margin: '10px 0 0' }}>Messen.</h3><p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>Raspberry Pi und Sensorik liefern später aggregierte Zählwerte sicher an die Ingestion-Schicht.</p></div>
            <div><span className="eyebrow"><Database size={12} /> Data</span><h3 style={{ fontSize: 26, letterSpacing: '-.04em', margin: '10px 0 0' }}>Verstehen.</h3><p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>Supabase speichert Snapshots, Health-Daten und historische Forecasts für echte prospektive Evaluation.</p></div>
            <div><span className="eyebrow"><Sparkles size={12} /> Intelligence</span><h3 style={{ fontSize: 26, letterSpacing: '-.04em', margin: '10px 0 0' }}>Entscheiden.</h3><p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>Forecast, Unsicherheit und Visit Score verdichten die Daten zu einer klaren Besuchsempfehlung.</p></div>
          </div>
        </Card>
      </section>
    </div>
  );
}
