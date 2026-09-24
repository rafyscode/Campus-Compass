import { Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart } from 'recharts';
import type { WeekdayProfilePoint } from '../../types/domain';

export function WeekdayChart({ data }: { data: WeekdayProfilePoint[] }) {
  return (
    <div className="chart-wrap" role="img" aria-label="Durchschnittliche Auslastung nach Wochentag">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
          <XAxis dataKey="weekday" tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 'auto']} tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value)}%`} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-solid)', fontSize: 10 }} formatter={(value) => `${Number(value).toFixed(0)} %`} />
          <Bar dataKey="mean" name="Mittelwert" fill="var(--brand-primary)" fillOpacity={0.75} radius={[8, 8, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
