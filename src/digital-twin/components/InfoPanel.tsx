import { useCampusStore } from '../stores/campusStore'
import type { CampusCategory } from '../types/campus'
import type { OccupancySnapshot } from '../../types/domain'

export function InfoPanel({ current, forecastMinute = 0 }: { current: OccupancySnapshot; forecastMinute?: number }) {
  const selected = useCampusStore((state) => state.selected)
  const setSelected = useCampusStore((state) => state.setSelected)

  if (!selected) return null

  return (
    <aside className="info-panel" aria-live="polite">
      <button className="panel-close" onClick={() => setSelected(null)} aria-label="Info schließen">×</button>
      <div className="eyebrow">{selected.category === 'building' ? 'Gebäude' : categoryLabel(selected.category)}</div>
      <h2>{selected.name}</h2>
      {selected.buildingNumber && <div className="building-number">C {selected.buildingNumber}</div>}
      <p>{selected.description}</p>
      {selected.id === 'mensa' && <div className="twin-occupancy">
        <strong>{current.percent >= 0 ? `${Math.round(current.percent)} % Auslastung` : 'Auslastung unbekannt'}</strong>
        <span>{forecastMinute ? `Prognose in ${forecastMinute} Minuten` : 'Aktueller Stand'} · {current.source === 'demo' ? 'DEMO DATA' : 'LIVE DATA'}</span>
        <small>{current.count !== null && !forecastMinute ? `${current.count} Geräte erfasst` : `Live-Daten aktiv`}</small>
      </div>}

      <dl className="meta-grid">
        {selected.heightMeters && <>
          <dt>Höhe</dt>
          <dd>{selected.heightMeters.toLocaleString('de-DE', { maximumFractionDigits: 2 })} m</dd>
        </>}
        <dt>Geodaten</dt>
        <dd><span className={`confidence confidence-${selected.confidence}`}>{selected.confidence === 'verified' ? 'Quellenbelegt' : selected.confidence === 'derived' ? 'Abgeleitet' : 'Geschätzt'}</span></dd>
        <dt>Quelle</dt>
        <dd>{selected.source}</dd>
      </dl>
    </aside>
  )
}

function categoryLabel(category: CampusCategory) {
  const labels = {
    landmark: 'Wahrzeichen',
    food: 'Gastronomie',
    library: 'Bibliothek',
    teaching: 'Lehre',
    administration: 'Service / Verwaltung',
    'student-life': 'Studentisches Leben',
    green: 'Grünfläche',
    transport: 'Mobilität',
  } as const
  return labels[category]
}
