import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/app.css';
import type { CampusPoi } from '../types/campus';
import type { OccupancySnapshot } from '../../types/domain';
import { campusPois } from '../data/campus/pois';
import { useCampusStore } from '../stores/campusStore';
import { findBuildingPoi, getBuildingHeight } from '../utils/buildingSelection';
import { resolveQuality } from '../utils/quality';
import { CAMPUS_BOUNDS, HOME_CAMERA, OPENFREEMAP_STYLE } from '../map/constants';
import { addCampusLayers, applyMapMode } from '../map/layers';
import { clearBuildingHighlight, highlightBuildingFeature } from '../map/highlight';
import { SearchBox } from './SearchBox';
import { InfoPanel } from './InfoPanel';
import { MapControls } from './MapControls';
import { Legend } from './Legend';

interface CampusMapProps { current: OccupancySnapshot; compact?: boolean; forecastMinute?: number }

export function CampusMap({ current, compact = false, forecastMinute = 0 }: CampusMapProps) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const quality = useCampusStore((state) => state.quality);
  const mapMode = useCampusStore((state) => state.mapMode);
  const showLabels = useCampusStore((state) => state.showLabels);
  const showCampusBoundary = useCampusStore((state) => state.showCampusBoundary);
  const setSelected = useCampusStore((state) => state.setSelected);
  const selected = useCampusStore((state) => state.selected);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!mapNode.current) return;
    const initial = useCampusStore.getState();
    const resolvedQuality = resolveQuality(initial.quality);
    let map: Map;
    try {
      map = new maplibregl.Map({
        container: mapNode.current, style: OPENFREEMAP_STYLE, ...HOME_CAMERA,
        minZoom: 14.2, maxZoom: 19.5, minPitch: 0, maxPitch: 70,
        attributionControl: false,
        canvasContextAttributes: { antialias: resolvedQuality !== 'performance' },
        pixelRatio: Math.min(window.devicePixelRatio || 1, resolvedQuality === 'high' ? 2 : resolvedQuality === 'balanced' ? 1.5 : 1),
        maxTileCacheZoomLevels: resolvedQuality === 'performance' ? 2 : 4,
        maxBounds: [[10.3930, 53.2245], [10.4085, 53.2325]],
        interactive: !compact, cooperativeGestures: !compact,
      });
    } catch {
      setLoadError('Die 3D-Karte benötigt WebGL. Bitte einen Browser mit aktivierter Grafikbeschleunigung verwenden.');
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    const resize = new ResizeObserver(() => {
      map.resize();
      if (compact) map.fitBounds(CAMPUS_BOUNDS, { padding: 24, duration: 0, pitch: 45, maxZoom: HOME_CAMERA.zoom });
    });
    resize.observe(mapNode.current);
    const timeout = window.setTimeout(() => {
      if (!map.isStyleLoaded()) setLoadError('Die Kartendaten konnten nicht vollständig geladen werden. Bitte die Internetverbindung prüfen.');
    }, 20000);
    map.on('load', () => {
      window.clearTimeout(timeout);
      try {
        addCampusLayers(map, resolvedQuality, useCampusStore.getState().mapMode);
        map.setLight({ anchor: 'map', color: '#fff8ee', intensity: 0.48, position: [1.15, 210, 38] });
        map.on('mousemove', 'campus-3d-buildings', (event) => { map.getCanvas().style.cursor = event.features?.length ? 'pointer' : ''; });
        map.on('mouseleave', 'campus-3d-buildings', () => { map.getCanvas().style.cursor = ''; });
        map.on('click', 'campus-3d-buildings', (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          highlightBuildingFeature(map, feature);
          const poi = findBuildingPoi(feature, campusPois);
          const props = feature.properties ?? {};
          setSelected(poi ? { ...poi } : {
            id: String(feature.id ?? `building-${event.lngLat.lng}-${event.lngLat.lat}`),
            name: String(props.name || props.ref || 'Campusgebäude'),
            category: 'building', coordinates: event.lngLat.toArray() as [number, number],
            description: 'Gebäudegrundriss aus OpenStreetMap-basierten Vektordaten. Für dieses Gebäude liegen keine Auslastungsdaten vor.',
            source: 'OpenStreetMap via OpenFreeMap / OpenMapTiles', confidence: 'derived',
            heightMeters: getBuildingHeight(feature),
          });
        });
        map.resize(); setLoadError(null); setReady(true);
      } catch (error) {
        console.error('Campuskarte:', error);
        setLoadError('Die Campuskarte konnte nicht initialisiert werden. Bitte erneut versuchen.');
      }
    });
    map.on('error', () => {
      setLoadError('Einige Kartendaten konnten nicht geladen werden. Bitte die Internetverbindung prüfen oder erneut laden.');
    });
    return () => { window.clearTimeout(timeout); resize.disconnect(); map.remove(); mapRef.current = null; };
  }, [attempt, compact, setSelected]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty('campus-poi-labels', 'visibility', showLabels ? 'visible' : 'none');
    for (const layer of ['campus-boundary-fill', 'campus-boundary-line-outer', 'campus-boundary-line', 'campus-boundary-label']) {
      map.setLayoutProperty(layer, 'visibility', showCampusBoundary ? 'visible' : 'none');
    }
    const resolved = resolveQuality(quality);
    map.setPixelRatio(Math.min(window.devicePixelRatio || 1, resolved === 'high' ? 2 : resolved === 'balanced' ? 1.5 : 1));
    map.setLayerZoomRange('campus-3d-buildings', compact ? 14.2 : resolved === 'performance' ? 15.15 : 14.4, 24);
    applyMapMode(map, mapMode, resolved);
  }, [quality, mapMode, showLabels, showCampusBoundary, ready, compact]);

  useEffect(() => {
    const map = mapRef.current;
    const mensa = campusPois.find((poi) => poi.id === 'mensa');
    if (!map || !ready || !mensa) return;
    const element = document.createElement(compact ? 'div' : 'button');
    element.className = 'cc-twin-occupancy-marker';
    const percentStr = current.percent >= 0 ? `${Math.round(current.percent)} %` : '—';
    element.textContent = `Mensa · ${percentStr}${forecastMinute ? ` · +${forecastMinute} Min.` : ''}`;
    element.setAttribute('aria-label', `Mensa: ${percentStr} Auslastung, ${current.source === 'demo' ? 'Demodaten' : 'Live-Daten'}${forecastMinute ? ', Prognose' : ''}`);
    if (!compact) element.addEventListener('click', () => setSelected({ ...mensa }));
    const marker = new maplibregl.Marker({ element, anchor: 'bottom', offset: [0, -12] }).setLngLat(mensa.coordinates).addTo(map);
    return () => { marker.remove(); };
  }, [current.percent, current.source, forecastMinute, compact, ready, setSelected]);

  useEffect(() => {
    if (!selected && ready && mapRef.current) clearBuildingHighlight(mapRef.current);
  }, [selected, ready]);

  function home() {
    if (!ready || !mapRef.current) return;
    setSelected(null); clearBuildingHighlight(mapRef.current);
    mapRef.current.easeTo({ ...HOME_CAMERA, duration: reduceMotion ? 0 : 900 });
  }
  function focusPoi(poi: CampusPoi) {
    setSelected({ ...poi });
    const map = mapRef.current;
    if (!map || !ready) return;
    map.flyTo({ center: poi.coordinates, zoom: 18, pitch: 58, bearing: -19, duration: reduceMotion ? 0 : 1000 });
    const highlight = () => {
      const feature = map.queryRenderedFeatures(map.project(poi.coordinates), { layers: ['campus-3d-buildings'] })[0];
      if (feature) highlightBuildingFeature(map, feature);
      else clearBuildingHighlight(map);
    };
    if (map.isMoving()) map.once('moveend', highlight); else highlight();
  }

  return (
    <section className={`cc-twin${compact ? ' cc-twin--compact' : ''}`} aria-label="Interaktive Campuskarte der Leuphana">
      <div ref={mapNode} className="map-canvas" />
      {!compact && <>
        <header className="topbar">
          <div className="brand-card"><div className="brand-mark">C</div><div><strong>Campus Compass</strong><span>Leuphana · Digital Twin</span></div></div>
          <SearchBox onSelect={focusPoi} />
        </header>
        <MapControls onHome={home} onZoomIn={() => mapRef.current?.zoomIn({ duration: reduceMotion ? 0 : 250 })} onZoomOut={() => mapRef.current?.zoomOut({ duration: reduceMotion ? 0 : 250 })} />
        <InfoPanel current={current} forecastMinute={forecastMinute} />
        <Legend />
      </>}
      {!ready && !loadError && <div className="loading-card" role="status"><span className="spinner" /> Campuskarte wird geladen …</div>}
      {loadError && <div className="error-card" role="alert"><p>{loadError}</p><button type="button" onClick={() => { setReady(false); setLoadError(null); setAttempt((value) => value + 1); }}>Erneut laden</button></div>}
    </section>
  );
}
