import { useTranslation } from '../../i18n/context';
import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/app.css';
import '../styles/wayfinding.css';
import '../styles/product-map.css';
import type { CampusPoi } from '../types/campus';

import { campusPois } from '../data/campus/pois';
import { useCampusStore } from '../stores/campusStore';
import { resolveQuality } from '../utils/quality';
import type { RoomReference } from '../utils/search';
import { CAMPUS_BOUNDS, HOME_CAMERA, OPENFREEMAP_STYLE } from '../map/constants';
import { addCampusLayers, applyMapMode } from '../map/layers';
import { highlightBuilding } from '../map/highlight';
import { SearchBox } from './SearchBox';
import { InfoPanel } from './InfoPanel';
import { MapControls } from './MapControls';
import { Legend } from './Legend';
import { RoutePlanner } from './RoutePlanner';
import type { CampusRoute } from '../utils/routing';

import type { OccupancySnapshot } from "../../types/domain";
interface CampusMapProps { current: OccupancySnapshot; forecastMinute?: number; compact?: boolean }
const motionDuration = (duration: number) => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;

function fitCampus(map: Map, compact: boolean, pitch = 30, duration = 0) {
  const mobile = map.getContainer().clientWidth < 650;
  map.fitBounds(CAMPUS_BOUNDS, { padding: compact ? 28 : { top: mobile ? 155 : 115, bottom: 65, left: mobile ? 24 : 50, right: mobile ? 24 : 145 },
    pitch, bearing: 0, maxZoom: 17.2, duration: motionDuration(duration) });
}
function selectPoi(map: Map | null, poi: CampusPoi, room?: RoomReference) {
  useCampusStore.getState().setSelected({ ...poi, properties: room ? { room } : undefined });
  if (map) map.flyTo({ center: poi.coordinates, zoom: Math.max(map.getZoom(), 17.4), pitch: 38,
    offset: [map.getContainer().clientWidth < 650 ? 0 : 100, -45], duration: motionDuration(850) });
}

export function CampusMap({ current, forecastMinute, compact = false }: CampusMapProps) {
  const { t, percent: percentDE } = useTranslation();
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const labels = useRef(new globalThis.Map<string, HTMLElement>());
  const overview = useRef(true);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [routeDestination, setRouteDestination] = useState('central-building');
  const routePlanner = useRef<HTMLDivElement>(null);
  const { quality, mapMode, showLabels, showCampusBoundary, showPulse, selected, setSelected } = useCampusStore();

  useEffect(() => {
    if (!mapNode.current) return;
    const initial = useCampusStore.getState();
    const resolvedQuality = resolveQuality(initial.quality);
    let map: Map;
    try {
      map = new maplibregl.Map({ container: mapNode.current, ...HOME_CAMERA,
        locale: { 'Map.Title': 'Campuskarte', 'AttributionControl.ToggleAttribution': 'Kartenquellen anzeigen', 'CooperativeGesturesHandler.WindowsHelpText': 'Strg gedrückt halten und scrollen, um zu zoomen', 'CooperativeGesturesHandler.MacHelpText': '⌘ gedrückt halten und scrollen, um zu zoomen', 'CooperativeGesturesHandler.MobileHelpText': 'Die Karte mit zwei Fingern bewegen' },
        minZoom: 13.5, maxZoom: 19.5, minPitch: 0, maxPitch: 65, attributionControl: false,
        canvasContextAttributes: { antialias: resolvedQuality !== 'performance' },
        pixelRatio: Math.min(window.devicePixelRatio || 1, resolvedQuality === 'high' ? 2 : resolvedQuality === 'balanced' ? 1.5 : 1),
        maxTileCacheZoomLevels: resolvedQuality === 'performance' ? 2 : 4,
        maxBounds: [[10.390, 53.223], [10.411, 53.234]], interactive: !compact, cooperativeGestures: !compact,
        transformRequest: url => ({ url, credentials: 'same-origin' }) });
    } catch {
      setLoadError('Die 3D-Karte benötigt WebGL. Bitte die Grafikbeschleunigung im Browser aktivieren.'); return;
    }
    mapRef.current = map;
    map.on('error', () => setLoadError('Eine Kartenressource ist nicht erreichbar. Bitte die Verbindung prüfen oder erneut laden.'));
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    const resize = new ResizeObserver(() => { map.resize(); if (overview.current) fitCampus(map, compact, map.getPitch()); });
    resize.observe(mapNode.current);
    map.on('dragstart', () => { overview.current = false; });
    map.on('zoomstart', event => { if (event.originalEvent) overview.current = false; });
    const timeout = window.setTimeout(() => {
      if (!map.isStyleLoaded()) setLoadError('Die Kartengrundlage konnte nicht geladen werden. Bitte die Internetverbindung prüfen.');
    }, 20000);
    map.on('load', () => {
      window.clearTimeout(timeout);
      try {
        addCampusLayers(map, resolvedQuality, useCampusStore.getState().mapMode);
        map.setLight({ anchor: 'map', color: '#fff8ee', intensity: 0.42, position: [1.15, 210, 38] });
        let hovered: string | number | undefined;
        map.on('mousemove', 'campus-3d-buildings', event => {
          map.getCanvas().style.cursor = 'pointer';
          if (hovered !== undefined) map.setFeatureState({ source: 'campus-buildings', id: hovered }, { hover: false });
          hovered = event.features?.[0]?.id;
          if (hovered !== undefined) map.setFeatureState({ source: 'campus-buildings', id: hovered }, { hover: true });
        });
        map.on('mouseleave', 'campus-3d-buildings', () => {
          map.getCanvas().style.cursor = '';
          if (hovered !== undefined) map.setFeatureState({ source: 'campus-buildings', id: hovered }, { hover: false });
          hovered = undefined;
        });
        map.on('click', 'campus-3d-buildings', event => {
          const poi = campusPois.find(item => item.id === event.features?.[0]?.properties.id);
          if (poi) { overview.current = false; selectPoi(map, poi); }
        });
        map.resize(); fitCampus(map, compact); setLoadError(null); setReady(true);
      } catch (error) { console.error('Campuskarte:', error); setLoadError('Die Campuskarte konnte nicht initialisiert werden. Bitte erneut versuchen.'); }
    });
    // Remove generic labels before the first tile is rendered. The local campus
    // dataset supplies these labels; hiding them after load still requests
    // unavailable generic POI sprites from the upstream style.
    map.setStyle(OPENFREEMAP_STYLE, { transformStyle: (_previous, next) => ({
      ...next,
      layers: next.layers.filter(layer => layer.type !== 'symbol' && !('source-layer' in layer && layer['source-layer'] === 'building')),
    }) });
    return () => { window.clearTimeout(timeout); resize.disconnect(); map.remove(); mapRef.current = null; };
  }, [attempt, compact]);

  // Translate MapLibre's generated controls without recreating the map or camera.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().setAttribute('aria-label', t('Campuskarte'));
    const container = map.getContainer();
    const attribution = container.querySelector('.maplibregl-ctrl-attrib-button');
    attribution?.setAttribute('title', t('Kartenquellen anzeigen'));
    attribution?.setAttribute('aria-label', t('Kartenquellen anzeigen'));
    const desktop = container.querySelector('.maplibregl-desktop-message');
    if (desktop) desktop.textContent = t(desktop.textContent?.includes('⌘')
      ? '⌘ gedrückt halten und scrollen, um zu zoomen' : 'Strg gedrückt halten und scrollen, um zu zoomen');
    const mobile = container.querySelector('.maplibregl-mobile-message');
    if (mobile) mobile.textContent = t('Die Karte mit zwei Fingern bewegen');
  }, [t, ready, attempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const markerList: maplibregl.Marker[] = [];
    const elements = labels.current;
    for (const poi of campusPois) {
      const building = Boolean(poi.heightMeters || poi.buildingNumber || poi.category === 'library' || poi.id.startsWith('lecture-hall'));
      if (compact && !['mensa', 'library', 'central-building'].includes(poi.id)) continue;
      const element = document.createElement(compact ? 'div' : 'button');
      element.className = `cc-building-label${!building ? ' cc-place-label' : ''}${poi.category === 'landmark' ? ' is-landmark' : ''}${poi.id === 'mensa' ? ' is-mensa' : ''}`;
      element.dataset.buildingId = poi.id;
      element.style.setProperty('--building-color', poi.id === 'mensa' ? '#7B0832' : poi.category === 'landmark' ? '#65565e' : '#dfdad5');
      element.setAttribute('aria-label', poi.name);
      element.title = poi.name;
      if (!compact) { element.setAttribute('type', 'button'); element.addEventListener('click', () => { overview.current = false; selectPoi(map, poi); }); }
      const number = document.createElement('span'); number.className = 'cc-building-label-number';
      number.textContent = poi.buildingNumber ? `C ${poi.buildingNumber}` : poi.shortLabel || poi.name;
      element.append(number);
      if (poi.buildingNumber && !/^Gebäude \d+$/.test(poi.name)) {
        const name = document.createElement('span'); name.className = 'cc-building-label-name';
        name.textContent = poi.shortLabel || poi.name; element.append(name);
      }
      if (poi.id === 'mensa') { const live = document.createElement('span'); live.className = 'cc-building-label-live cc-building-label-occupancy'; element.append(live); }
      elements.set(poi.id, element);
      markerList.push(new maplibregl.Marker({ element, anchor: 'center' }).setLngLat(poi.coordinates).addTo(map));
    }
    const updateDetail = () => {
      map.getContainer().classList.toggle('is-detailed', map.getZoom() > 17.2);
      map.getContainer().classList.toggle('is-overview', map.getZoom() < 16);
    };
    map.on('zoomend', updateDetail); updateDetail();
    return () => { map.off('zoomend', updateDetail); markerList.forEach(marker => marker.remove()); elements.clear(); };
  }, [ready, compact, attempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const layer of ['campus-boundary-fill', 'campus-boundary-glow', 'campus-boundary-line-outer', 'campus-boundary-line']) {
      map.setLayoutProperty(layer, 'visibility', showCampusBoundary ? 'visible' : 'none');
    }
    const resolved = resolveQuality(quality);
    map.setPixelRatio(Math.min(window.devicePixelRatio || 1, resolved === 'high' ? 2 : resolved === 'balanced' ? 1.5 : 1));
    applyMapMode(map, mapMode, resolved);
    highlightBuilding(map, compact ? null : selected?.id ?? null);
    for (const [id, element] of labels.current) {
      element.style.display = showLabels ? '' : 'none';
      element.classList.toggle('is-selected', !compact && selected?.id === id);
      element.setAttribute('aria-pressed', String(!compact && selected?.id === id));
      const live = element.querySelector<HTMLElement>('.cc-building-label-live');
      if (live) {
        live.hidden = !showPulse;
        const percentStr = current.percent >= 0 ? `${Math.round(current.percent)} %` : '—';
live.textContent = current.percent >= 0 ? `${percentStr} · ${current.source === 'demo' ? 'Demodaten' : 'Live-Daten'}${forecastMinute ? `, +${forecastMinute} Min.` : ''}` : t('Keine Messung');
      }
    }
  }, [quality, mapMode, showLabels, showCampusBoundary, showPulse, ready, selected, compact, current, forecastMinute, percentDE, t]);

  function home(pitch = 30) {
    if (!ready || !mapRef.current) return;
    overview.current = true; setSelected(null); fitCampus(mapRef.current, compact, pitch, 850);
  }
  function displayRoute(route: CampusRoute | null) {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource('campus-route') as GeoJSONSource).setData({ type: 'FeatureCollection', features: route && route.coordinates.length > 1 ? [{
      type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.coordinates },
    }] : [] });
    if (route && route.coordinates.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      route.coordinates.forEach(point => bounds.extend([point[0], point[1]]));
      overview.current = false; setSelected(null);
      map.fitBounds(bounds, { padding: { top: 140, bottom: 140, left: 60, right: 100 }, pitch: 0, maxZoom: 18, duration: motionDuration(850) });
      mapNode.current?.scrollIntoView({ behavior: motionDuration(1) ? 'smooth' : 'auto', block: 'center' });
    }
  }
  return <><section className={`cc-twin${compact ? ' cc-twin--compact' : ''}`} aria-label={t("Interaktive Campuskarte der Leuphana")}>
    <div ref={mapNode} className="map-canvas" />
    {!compact && <>
      <header className="topbar">
        <div className="brand-card"><div className="brand-mark">C</div><div><strong>Campus Compass</strong><span>{t("Leuphana · Digital Twin")}</span></div></div>
        <SearchBox onSelect={(poi, room) => { overview.current = false; selectPoi(mapRef.current, poi, room); }} />
      </header>
      <MapControls onHome={() => home()} onTop={() => home(0)} onOblique={() => home(40)}
        onZoomIn={() => { overview.current = false; mapRef.current?.zoomIn({ duration: motionDuration(250) }); }}
        onZoomOut={() => { overview.current = false; mapRef.current?.zoomOut({ duration: motionDuration(250) }); }} />
      <InfoPanel current={current} forecastMinute={forecastMinute}
        onRoute={id => { displayRoute(null); setRouteDestination(id); routePlanner.current?.scrollIntoView({ behavior: motionDuration(1) ? 'smooth' : 'auto', block: 'center' }); }} />
      <Legend />
      <div className="cc-twin-map-caption">{t("Zentralcampus · Leuphana ")}<span>{showPulse ? t('Mensa · Historischer Sensordatensatz') : t('Gebäude auswählen und entdecken')}</span></div>
    </>}
    {!ready && !loadError && <div className="loading-card" role="status"><span className="spinner" />{t(" Campuskarte wird geladen …")}</div>}
    {loadError && <div className="error-card" role="alert"><p>{t(loadError)}</p><button type="button" onClick={() => { setReady(false); setLoadError(null); setAttempt(value => value + 1); }}>{t("Erneut laden")}</button></div>}
  </section>{!compact && <div ref={routePlanner}><RoutePlanner key={routeDestination} destination={routeDestination} onRoute={displayRoute} /></div>}</>;
}
