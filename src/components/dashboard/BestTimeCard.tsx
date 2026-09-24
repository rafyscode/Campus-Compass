import { Clock3 } from 'lucide-react';
import type { ForecastPoint, OccupancySnapshot } from '../../types/domain';

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function getBestWindow(forecast: ForecastPoint[]) {
  const candidates = forecast.filter((point) => point.horizonMinutes >= 15 && point.horizonMinutes <= 120);
  if (candidates.length === 0) return null;
  const best = candidates.reduce((a, b) => (a.predictedPercent <= b.predictedPercent ? a : b), candidates[0]);
  const end = new Date(new Date(best.targetAt).getTime() + 25 * 60_000).toISOString();
  return { start: best.targetAt, end, percent: best.predictedPercent, confidence: best.confidence };
}

export function computeVisitScore(current: OccupancySnapshot, forecast: ForecastPoint[]) {
  const near = forecast.find((point) => point.horizonMinutes >= 30) ?? forecast[0];
  const currentP = Math.max(0, current.percent);
  const expected = near?.predictedPercent ?? currentP;
  const uncertainty = near ? near.upperBound - near.lowerBound : 10;
  return Math.round(Math.max(0, Math.min(100, 100 - currentP * 0.58 - expected * 0.25 - uncertainty * 0.85)));
}

export function BestTimeCard({ current, forecast }: { current: OccupancySnapshot; forecast: ForecastPoint[] }) {
  const best = getBestWindow(forecast);
  const score = computeVisitScore(current, forecast);
  const goNow = current.percent >= 0 && current.percent < 42 && (forecast[0]?.predictedPercent ?? current.percent) >= current.percent;
  return (
    <div className="best-time-card">
      <div className="best-time-icon"><Clock3 aria-hidden="true" /></div>
      <h3>{goNow ? <>Jetzt ist eine <span className="window">gute Zeit</span>.</> : <>Beste Zeit: <span className="window">{best ? `${formatTime(best.start)}–${formatTime(best.end)}` : '—'}</span></>}</h3>
      <p>{best ? `Erwartete Auslastung etwa ${best.percent.toFixed(0)} %. Die Empfehlung berücksichtigt Forecast, Unsicherheit und den aktuellen Trend.` : 'Noch kein Forecast verfügbar.'}</p>
      <div className="score-row"><div className="score-number">{score}<small>/100</small></div><div className="score-track" aria-label={`Visit Score ${score} von 100`}><div className="score-fill" style={{ width: `${score}%` }} /></div></div>
      <div className="metric-detail">Visit Score · höher ist besser</div>
    </div>
  );
}
