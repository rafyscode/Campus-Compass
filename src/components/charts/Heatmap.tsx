import type { HeatmapCell } from '../../types/domain';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
const HOURS = Array.from({ length: 15 }, (_, index) => 8 + index);

function heatColor(value: number) {
  if (value < 30) return 'color-mix(in srgb, var(--success) 55%, var(--surface-solid))';
  if (value < 55) return 'color-mix(in srgb, var(--success) 82%, var(--warning))';
  if (value < 75) return 'var(--warning)';
  return 'var(--danger)';
}

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const lookup = new Map(cells.map((cell) => [`${cell.weekday}-${cell.hour}`, cell.percent]));
  return (
    <div className="heatmap-scroll" role="img" aria-label="Heatmap der durchschnittlichen Auslastung nach Wochentag und Uhrzeit">
      <div className="heatmap-grid">
        <div />
        {HOURS.map((hour) => <div className="heatmap-label" key={`h-${hour}`}>{hour}</div>)}
        {WEEKDAYS.flatMap((weekday) => [
          <div className="heatmap-label" key={`${weekday}-label`}>{weekday}</div>,
          ...HOURS.map((hour) => {
            const value = lookup.get(`${weekday}-${hour}`) ?? 0;
            return <div className="heatmap-cell" title={`${weekday} ${hour}:00 · ${value.toFixed(0)} %`} style={{ background: heatColor(value) }} key={`${weekday}-${hour}`}>{value.toFixed(0)}</div>;
          }),
        ])}
      </div>
    </div>
  );
}
