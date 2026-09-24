import { ArrowRight, Clock3, Gauge, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOccupancyLevel } from '../../config/app';
import type { CampusBuilding } from '../../data/campus';
import type { ForecastPoint, OccupancyHistoryPoint, OccupancySnapshot, SensorStatus } from '../../types/domain';
import { DataSourceBadge } from '../dashboard/DataSourceBadge';
import { formatRelativeTime } from './mapUtils';

function forecastValue(forecast: ForecastPoint[], minutes: number) {
  return forecast.find((point) => point.horizonMinutes === minutes)?.predictedPercent;
}

export function BuildingInfoPanel({ building, current, forecast, history, sensor, forecastMinute, displayedPercent, onClose }: {
  building: CampusBuilding;
  current: OccupancySnapshot;
  forecast: ForecastPoint[];
  history: OccupancyHistoryPoint[];
  sensor: SensorStatus;
  forecastMinute: number;
  displayedPercent: number;
  onClose: () => void;
}) {
  const isMensa = building.id === 'mensa';
  const currentLevel = getOccupancyLevel(displayedPercent);
  const before = [...history].reverse().find((point) => new Date(current.capturedAt).getTime() - new Date(point.timestamp).getTime() >= 12 * 60_000);
  const trendDelta = before ? current.percent - before.percent : 0;
  const best = [...forecast].sort((a, b) => a.predictedPercent - b.predictedPercent)[0];

  return (
    <aside className="campus-building-panel" aria-live="polite">
      <div className="campus-building-panel-head">
        <div><span className="campus-panel-eyebrow">{building.category.toUpperCase()}</span><h3>{building.name}</h3></div>
        <button type="button" className="campus-panel-close" aria-label="Detailpanel schließen" onClick={onClose}>×</button>
      </div>
      <p className="campus-building-description">{building.description}</p>
      <div className="campus-geometry-note">Geometrie: {building.geometryConfidence === 'georeferenced-anchor' ? 'georeferenzierter Anker + Planapproximation' : 'Campusplan-Approximation'} · Höhe {building.heightApproximate ? 'visuell approximiert' : 'publiziert'}</div>
      {isMensa ? (
        <>
          <div className="campus-live-hero">
            <div><span>{forecastMinute === 0 ? (current.source === 'demo' ? 'Aktuelle Simulation' : 'Aktuelle Auslastung') : `Forecast +${forecastMinute} Min.`}</span><strong>{displayedPercent.toFixed(0)}%</strong><small>{currentLevel.label}</small></div>
            <DataSourceBadge mode={current.source} />
          </div>
          <div className="campus-detail-metrics">
            <div><Clock3 size={14} /><span>Update</span><strong>{formatRelativeTime(current.capturedAt)}</strong></div>
            <div>{trendDelta <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}<span>15-Min-Trend</span><strong>{trendDelta > 0 ? '+' : ''}{trendDelta.toFixed(0)}%</strong></div>
            <div><Gauge size={14} /><span>Confidence</span><strong>{Math.round((forecastMinute === 0 ? current.confidence : (forecast.find((point) => point.horizonMinutes === forecastMinute)?.confidence ?? current.confidence)) * 100)}%</strong></div>
            <div><Sparkles size={14} /><span>Sensor</span><strong>{current.source === 'demo' ? 'Simulation' : sensor.state === 'online' ? 'bereit' : sensor.state}</strong></div>
          </div>
          <div className="campus-mini-forecast">
            {[15, 30, 60].map((minutes) => <div key={minutes}><span>+{minutes}</span><strong>{forecastValue(forecast, minutes)?.toFixed(0) ?? '—'}%</strong></div>)}
          </div>
          <div className="campus-best-window"><span>Ruhigstes prognostiziertes Fenster</span><strong>{best ? `in ${best.horizonMinutes} Minuten · ${best.predictedPercent.toFixed(0)}%` : 'Noch keine Prognose'}</strong></div>
          <Link to="/live" className="campus-panel-link">OPEN FULL LIVE VIEW <ArrowRight size={14} /></Link>
        </>
      ) : (
        <div className="campus-no-sensor"><span>NO ACTIVE OCCUPANCY FEED</span><strong>Für dieses Gebäude liegen aktuell keine Live-Werte vor.</strong><p>Die Datenarchitektur ist für die spätere Anbindung weiterer Gebäude- und Zonen-Sensoren vorbereitet.</p></div>
      )}
    </aside>
  );
}
