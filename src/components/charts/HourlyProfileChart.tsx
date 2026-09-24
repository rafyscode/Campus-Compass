import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HourlyProfilePoint } from '../../types/domain';

export function HourlyProfileChart({ data }: { data: HourlyProfilePoint[] }) {
  return (
    <div className="chart-wrap" role="img" aria-label="Durchschnittliche Auslastung nach Uhrzeit">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
          <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 'auto']} tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value)}%`} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-solid)', fontSize: 10 }} formatter={(value) => `${Number(value).toFixed(0)} %`} />
          <Bar dataKey="mean" name="Mittelwert" fill="var(--brand-primary)" fillOpacity={0.18} radius={[5, 5, 0, 0]} />
          <Line type="monotone" dataKey="median" name="Median" stroke="var(--brand-primary)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
