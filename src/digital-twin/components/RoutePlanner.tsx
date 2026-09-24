import { useTranslation } from '../../i18n/context';
import { useMemo, useState } from 'react';
import type { FeatureCollection, LineString } from 'geojson';
import pathsText from '../data/campus/walkways.geojson?raw';
import { campusPois } from '../data/campus/pois';
import { createWalkGraph, findCampusRoute, type CampusRoute, type WalkwayProperties } from '../utils/routing';

const graph = createWalkGraph(JSON.parse(pathsText) as FeatureCollection<LineString, WalkwayProperties>);
export function RoutePlanner({ destination, onRoute }: { destination: string; onRoute: (route: CampusRoute | null) => void }) {
  const { t } = useTranslation();
  const [start, setStart] = useState('library');
  const [end, setEnd] = useState(destination);
  const [shown, setShown] = useState(false);
  const route = useMemo(() => {
    const from = campusPois.find(p => p.id === start), to = campusPois.find(p => p.id === end);
    return from && to && from.id !== to.id ? findCampusRoute(graph, from.coordinates, to.coordinates) : null;
  }, [start, end]);
  return <section className="cc-route-planner" aria-label={t("Campus-Wegweiser")}>
    <div className="cc-route-heading"><strong>{t("Zu Fuß über den Campus")}</strong><span>{t("Wege aus OpenStreetMap")}</span></div>
    <div className="cc-route-fields">
      <label>{t("Start")}<select aria-label={t("Start der Route")} value={start} onChange={event => { setStart(event.target.value); setShown(false); onRoute(null); }}>
        {campusPois.map(poi => <option value={poi.id} key={poi.id}>{poi.name}</option>)}
      </select></label>
      <span aria-hidden="true">→</span>
      <label>{t("Ziel")}<select aria-label={t("Ziel der Route")} value={end} onChange={event => { setEnd(event.target.value); setShown(false); onRoute(null); }}>
        {campusPois.map(poi => <option value={poi.id} key={poi.id}>{poi.name}</option>)}
      </select></label>
      <button type="button" onClick={() => { setShown(true); onRoute(route); }}>{t("Route anzeigen")}</button>
      {shown && <button type="button" className="cc-route-clear" onClick={() => { setShown(false); onRoute(null); }}>{t("Löschen")}</button>}
    </div>
    {shown && <p role="status">{route ? <><strong>{t("Ca. ")}{route.minutes}{t(" Min. · ")}{Math.round(route.distance / 5) * 5} m</strong>{t(" auf erfassten Wegen. Start und Ziel sind die nächsten Wegpunkte in Gebäudenähe (Abstand zur Ortsmarkierung: ")}{Math.round(route.startGap)} / {Math.round(route.endGap)} m).</> : start === end ? t("Bitte verschiedene Start- und Zielorte auswählen.") : t("Zwischen diesen Orten ist kein durchgehender Fußweg im erfassten Wegenetz verfügbar.")}</p>}
    <small>{t("Gehzeit mit 4,7 km/h. Keine Indoor-Navigation; Barrierefreiheit und aktuelle Sperrungen sind nicht bestätigt.")}</small>
  </section>;
}
