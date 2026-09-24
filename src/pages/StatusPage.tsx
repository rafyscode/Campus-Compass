import type { ReactNode } from 'react';
import { Activity, BrainCircuit, Cloud, Database, Radio, RefreshCcw, Server, Wifi, type LucideIcon } from 'lucide-react';
import { FreshnessIndicator } from '../components/dashboard/FreshnessIndicator';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { APP_CONFIG } from '../config/app';
import { useCampusData } from '../hooks/useCampusData';

function StatusRow({ icon: Icon, title, detail, value, tone = 'neutral' }: { icon: LucideIcon; title: string; detail: ReactNode; value: string; tone?: 'live' | 'warning' | 'danger' | 'neutral' }) {
  return <div className="status-row"><div className="status-row-main"><span className="status-icon"><Icon /></span><div><strong>{title}</strong><span>{detail}</span></div></div><Badge tone={tone}>{value}</Badge></div>;
}

export default function StatusPage() {
  const { data, loading, error, refresh, online } = useCampusData();
  if (loading || !data) return <div className="content"><LoadingSkeleton /></div>;
  if (error) return <div className="content"><ErrorState message={error} onRetry={() => void refresh()} /></div>;
  const sensorTone = data.sensor.state === 'online' ? 'live' : data.sensor.state === 'warning' ? 'warning' : 'danger';
  return (
    <div className="content page-stack">
      <PageHeader eyebrow="System Status" title="Transparenz statt grüner Lämpchen." description="Datenquelle, Sensorfrische, Realtime, Modellstatus und Frontend-Version werden getrennt ausgewiesen." action={<button className="button" onClick={() => void refresh()} type="button"><RefreshCcw size={14} /> Aktualisieren</button>} />
      <div className="grid grid-2">
        <Card className="card-pad"><span className="card-title">Data & Sensor</span><div className="status-list" style={{ marginTop: 12 }}><StatusRow icon={Database} title="Datenquelle" detail="aktiver DataProvider" value={data.mode === 'live' ? 'Supabase' : 'System Mock'} tone={data.mode === 'live' ? 'live' : 'neutral'} /><StatusRow icon={Radio} title="Sensor" detail={data.sensor.message} value={data.sensor.state.toUpperCase()} tone={sensorTone} /><StatusRow icon={Activity} title="Letzte Messung" detail="Zeitstempel der letzten Messung" value={new Date(data.current.capturedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} tone={sensorTone} /></div></Card>
        <Card className="card-pad"><span className="card-title">Platform</span><div className="status-list" style={{ marginTop: 12 }}><StatusRow icon={Cloud} title="Supabase" detail="Frontend-Verbindung" value={data.sensor.supabaseConnected ? 'Connected' : 'Disconnected'} tone={data.sensor.supabaseConnected ? 'live' : 'neutral'} /><StatusRow icon={Wifi} title="Realtime" detail="Snapshot Updates" value={data.sensor.realtimeConnected ? 'Ready' : 'Disconnected'} tone={data.sensor.realtimeConnected ? 'live' : 'warning'} /><StatusRow icon={Server} title="Browser network" detail="navigator.onLine" value={online ? 'Online' : 'Offline'} tone={online ? 'live' : 'danger'} /></div></Card>
      </div>
      <div className="grid grid-3">
        <Card className="card-pad"><span className="card-title">Datenfrische</span><div style={{ marginTop: 18 }}><FreshnessIndicator timestamp={data.current.capturedAt} /></div><p className="metric-detail">Warnung ab {APP_CONFIG.staleThresholdSeconds}s · offline/stale ab {APP_CONFIG.offlineThresholdSeconds}s.</p></Card>
        <Card className="card-pad"><span className="card-title">API latency</span><div className="metric-value">{data.sensor.latencyMs ?? '—'}<span style={{ fontSize: 15, color: 'var(--text-tertiary)' }}> ms</span></div><div className="metric-detail">Roundtrip-Zeit der letzten Datenanfrage</div></Card>
        <Card className="card-pad"><span className="card-title">Model</span><div className="metric-value" style={{ fontSize: 21 }}>{data.model.version}</div><div className="metric-detail">{data.model.available ? 'Produktiv verfügbar' : 'Nicht verfügbar'}</div></Card>
      </div>
      <Card className="card-pad"><span className="card-title">Build</span><div className="status-list" style={{ marginTop: 10 }}><StatusRow icon={BrainCircuit} title="Frontend version" detail="Vite build" value={APP_CONFIG.appVersion} /><StatusRow icon={Server} title="Build date" detail="wird beim Build injiziert" value={new Date(APP_CONFIG.buildDate).toLocaleString('de-DE')} /><StatusRow icon={Database} title="Capacity config" detail="zentral in src/config/app.ts" value={`${APP_CONFIG.capacity}`} /></div></Card>
    </div>
  );
}
