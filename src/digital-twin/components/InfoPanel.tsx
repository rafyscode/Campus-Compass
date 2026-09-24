import { useTranslation } from '../../i18n/context';
import { Link } from 'react-router-dom';
import { useCampusStore } from '../stores/campusStore';
import type { CampusCategory } from '../types/campus';
import type { OccupancySnapshot } from "../../types/domain";

import type { RoomReference } from '../utils/search';
export function InfoPanel({ current, forecastMinute, onRoute }: { current: OccupancySnapshot; forecastMinute?: number; onRoute?: (id: string) => void }) {
  const { t, locale } = useTranslation();
  const selected = useCampusStore(state => state.selected);
  const setSelected = useCampusStore(state => state.setSelected);
  if (!selected) return null;
  const room = selected.properties?.room as RoomReference | undefined;
  return <aside className="info-panel" aria-live="polite" aria-label={t("Ausgewählt: ") + selected.name}>
    <button type="button" className="panel-close" onClick={() => setSelected(null)} aria-label={t("Auswahl schließen")}>×</button>
    <div className="eyebrow">{selected.category === 'building' ? t("Gebäude") : t(categoryLabel(selected.category))}</div>
    <h2>{selected.name}</h2>
    {selected.buildingNumber && <div className="building-number">C {selected.buildingNumber}</div>}
    {room && <div className="room-reference"><span>{t("Gesuchter Raum")}</span><strong>{room.label}</strong><span>{room.floor === 0 ? t("Erdgeschoss") : t('{floor}. Etage', { floor: room.floor })}{t(" · Raum ")}{room.room}</span><small>{t("Das zugehörige Gebäude ist markiert. Genaue Raumposition und Indoor-Weg sind nicht hinterlegt.")}</small></div>}
    <p>{t(selected.description)}</p>
    {selected.id === 'mensa' && <div className="twin-occupancy"><span>{t("Letzte reale Messung")}</span>
      {current.percent >= 0 ? <><strong>{current.count}{t(" Personen · ")}{Math.round(current.percent)}%</strong><span>{current.source === 'demo' ? t("Demodaten") : t("Live-Daten")}</span><small>{forecastMinute ? t(`Prognose in ${forecastMinute} Minuten`) : t("Aktueller Stand")}</small></> : <span>{t("Auslastung unbekannt")}</span>}
      <Link className="text-link" to="/forecast">{t("Forecast Replay öffnen →")}</Link>
    </div>}
    {selected.id !== 'mensa' && <p className="cc-data-unavailable">{t("Für diesen Ort liegen keine Auslastungsmessungen vor.")}</p>}
    {onRoute && <button type="button" className="cc-route-button" onClick={() => onRoute(selected.id)}>{t("Route hierhin planen →")}</button>}
    <details className="building-data"><summary>{t("Gebäudedaten & Quellen")}</summary><dl className="meta-grid">
      {selected.heightMeters && <><dt>{t("Höhe")}</dt><dd>{selected.heightMeters.toLocaleString(locale, { maximumFractionDigits: 2 })} m</dd></>}
      <dt>{t("Geodaten")}</dt><dd>{selected.confidence === 'verified' ? t("Quellenbelegt") : selected.confidence === 'derived' ? t("Abgeleitet") : t("Geschätzt")}</dd><dt>{t("Quelle")}</dt><dd>{selected.source}</dd>
    </dl></details>
  </aside>;
}
function categoryLabel(category: CampusCategory) {
  const labels: Record<string, string> = { landmark: 'Wahrzeichen', food: 'Gastronomie', library: 'Bibliothek', teaching: 'Lehre', administration: 'Service / Verwaltung', 'student-life': 'Studentisches Leben', green: 'Grünfläche', transport: 'Mobilität', sports: 'Sport' };
  return labels[category] ?? 'Campus-Ort';
}

