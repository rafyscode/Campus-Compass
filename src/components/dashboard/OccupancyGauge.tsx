import type { CSSProperties } from 'react';
import { getOccupancyLevel } from '../../config/app';
import type { OccupancySnapshot, TrendDirection } from '../../types/domain';
import { FreshnessIndicator } from './FreshnessIndicator';
import { TrendIndicator } from './TrendIndicator';
import { useTranslation } from '../../i18n/context';

export function OccupancyGauge({ snapshot, trend, delta15 }: { snapshot: OccupancySnapshot; trend: TrendDirection; delta15: number }) {
  const { t } = useTranslation();
  const level = getOccupancyLevel(snapshot.percent);
  const gaugeColor = level.tone === 'success' ? 'var(--success)' : level.tone === 'warning' ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="occupancy-gauge">
      <div className="gauge-ring" style={{ '--value': snapshot.percent >= 0 ? snapshot.percent : 0, '--gauge-color': gaugeColor } as CSSProperties} aria-label={snapshot.percent >= 0 ? `${snapshot.percent.toFixed(0)} Prozent Auslastung` : 'Unbekannte Auslastung'}>
        <div className="gauge-center"><div className="gauge-value">{snapshot.percent >= 0 ? snapshot.percent.toFixed(0) : '—'}<span>{snapshot.percent >= 0 ? '%' : ''}</span></div><div className="gauge-caption">Auslastung</div></div>
      </div>
      <div className="gauge-details">
        <span className={`eyebrow tone-${level.tone}`}>{t(level.label)}</span>
        <h2>{snapshot.count == null ? 'Auslastung aktuell' : `${snapshot.count} geschätzte Personen`}</h2>
        <p>Der aktuelle Wert wird aus dem Live-Datenstream berechnet und mit Trend, Datenalter und Sensorstatus kombiniert.</p>
        <div className="inline-stats">
          <div className="inline-stat"><strong><TrendIndicator direction={trend} value={snapshot.percent >= 0 ? delta15 : undefined} /></strong><span>gegenüber vor 15 Min.</span></div>
          <div className="inline-stat"><strong>{Math.round(snapshot.confidence * 100)} %</strong><span>Messkonfidenz</span></div>
          <div className="inline-stat"><strong><FreshnessIndicator timestamp={snapshot.capturedAt} /></strong><span>Datenfrische</span></div>
        </div>
      </div>
    </div>
  );
}
