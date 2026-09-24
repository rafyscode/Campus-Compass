import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ForecastPoint, OccupancyHistoryPoint } from '../../types/domain';

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function OccupancyTimeline({ history, forecast, compact = false }: { history: OccupancyHistoryPoint[]; forecast: ForecastPoint[]; compact?: boolean }) {
  const observed = history.slice(compact ? -18 : -36).map((point) => ({
    time: timeLabel(point.timestamp),
    observed: point.percent,
    typical: point.typicalPercent,
    forecast: null as number | null,
    lower: null as number | null,
    upper: null as number | null,
    band: null as number | null,
    now: false,
  }));
  const bridge = observed.at(-1);
  const future = forecast.slice(0, compact ? 12 : 24).map((point, index) => ({
    time: timeLabel(point.targetAt),
    observed: null as number | null,
    typical: null as number | null,
    forecast: point.predictedPercent,
    lower: point.lowerBound,
    upper: point.upperBound,
    band: point.upperBound - point.lowerBound,
    now: index === 0,
  }));
  const nowLabel = timeLabel(new Date().toISOString());
  const data: any[] = bridge ? [...observed, { ...bridge, forecast: bridge.observed, lower: bridge.observed, upper: bridge.observed, band: 0 }, ...future] : future;
  
  // Ensure the chart has a point for 'Jetzt' even if there is a gap
  if (bridge && bridge.time !== nowLabel && data.findIndex(d => d.time === nowLabel) === -1) {
    // Insert a dummy point for 'Jetzt' so the reference line draws at the correct place
    const futureIndex = data.findIndex(d => d.forecast !== null && d.time !== bridge.time);
    const nowPoint = {
      time: nowLabel,
      observed: null,
      typical: null,
      forecast: null,
      lower: null,
      upper: null,
      band: null,
      now: true,
    };
    if (futureIndex > -1) {
      data.splice(futureIndex, 0, nowPoint);
    }
  }

  return (
    <div className="chart-wrap" role="img" aria-label="Zeitreihe der beobachteten und prognostizierten Mensa-Auslastung">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 10, bottom: 4, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
          <XAxis dataKey="time" tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis domain={[0, 'auto']} tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value)}%`} />
          <Tooltip
            cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-solid)', fontSize: 10 }}
            formatter={(value, name) => [`${Number(value).toFixed(0)} %`, name === 'observed' ? 'Beobachtet' : name === 'forecast' ? 'Prognose' : name === 'typical' ? 'Typischer Tag' : name]}
          />
          <Area dataKey="lower" stackId="interval" stroke="none" fill="transparent" isAnimationActive={!compact} connectNulls />
          <Area dataKey="band" stackId="interval" stroke="none" fill="var(--brand-primary)" fillOpacity={0.09} isAnimationActive={!compact} connectNulls />
          <Line type="monotone" dataKey="observed" dot={false} stroke="var(--text-primary)" strokeWidth={2.2} isAnimationActive={!compact} connectNulls />
          <Line type="monotone" dataKey="forecast" dot={false} stroke="var(--brand-primary)" strokeWidth={2.2} strokeDasharray="7 5" isAnimationActive={!compact} connectNulls />
          {nowLabel && <ReferenceLine x={nowLabel} stroke="var(--brand-primary)" strokeOpacity={0.35} strokeDasharray="3 4" label={{ value: 'Jetzt', fill: 'var(--brand-primary)', fontSize: 9, position: 'insideTopRight' }} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
