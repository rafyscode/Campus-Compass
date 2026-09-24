import type { ExpressionSpecification, Map } from 'maplibre-gl';
import type { FeatureCollection, Polygon } from 'geojson';
import boundaryText from '../data/campus/campus-boundary.geojson?raw';
import { campusBuildings } from '../data/campus/buildings';
import { addLandscape } from './landscape';
import type { MapMode, QualityLevel } from '../types/campus';

const boundary = JSON.parse(boundaryText) as FeatureCollection<Polygon>;
const ring = boundary.features[0].geometry.coordinates[0];
const outside: FeatureCollection<Polygon> = { type: 'FeatureCollection', features: [{
  type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [
    [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], ring,
  ] },
}] };

const color: ExpressionSpecification = ['case', ['boolean', ['feature-state', 'selected'], false], '#7B0832', ['boolean', ['feature-state', 'hover'], false], '#b98b9d', ['boolean', ['feature-state', 'subordinate'], false], '#d5d0cb', ['==', ['get', 'id'], 'mensa'], '#8a3454', ['==', ['get', 'category'], 'landmark'], '#95828b', '#c6bfb7'];

export function addCampusLayers(map: Map, quality: Exclude<QualityLevel, 'auto'>, mode: MapMode = 'campus') {
  // Campus labels and footprints are a local, reviewed dataset. Suppress the
  // generic basemap POIs/buildings so they cannot contradict the campus plan.
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type === 'symbol' || ('source-layer' in layer && layer['source-layer'] === 'building')) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  }
  map.addSource('lgln-aerial', {
    type: 'raster', tileSize: 512, minzoom: 8, maxzoom: 20,
    tiles: ['https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ni_dop20&STYLES=&FORMAT=image/png&TRANSPARENT=FALSE&CRS=EPSG:3857&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}'],
    attribution: '© GeoBasis-DE/LGLN 2026',
  });
  map.addLayer({ id: 'lgln-aerial-layer', type: 'raster', source: 'lgln-aerial',
    layout: { visibility: mode === 'aerial' ? 'visible' : 'none' },
    paint: { 'raster-opacity': 1, 'raster-saturation': -0.2 },
  });
  map.addSource('campus-boundary', { type: 'geojson', data: boundary });
  map.addLayer({ id: 'campus-boundary-fill', type: 'fill', source: 'campus-boundary',
    paint: { 'fill-color': '#f1edda', 'fill-opacity': 0.2 },
  });
  addLandscape(map);
  map.addSource('campus-focus-mask', { type: 'geojson', data: outside });
  map.addLayer({ id: 'campus-focus-mask-fill', type: 'fill', source: 'campus-focus-mask',
    paint: { 'fill-color': '#f8f6f2', 'fill-opacity': 0.98 },
  });
  map.addLayer({ id: 'campus-boundary-glow', type: 'line', source: 'campus-boundary',
    paint: { 'line-color': '#7b1746', 'line-width': 18, 'line-opacity': 0.1, 'line-blur': 3 },
  });
  map.addLayer({ id: 'campus-boundary-line-outer', type: 'line', source: 'campus-boundary',
    paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 1 },
  });
  map.addLayer({ id: 'campus-boundary-line', type: 'line', source: 'campus-boundary',
    paint: { 'line-color': '#7b1746', 'line-width': 3.5, 'line-opacity': 1 },
  });

  map.addSource('campus-buildings', { type: 'geojson', data: campusBuildings });
  map.addLayer({ id: 'campus-building-footprints', type: 'fill', source: 'campus-buildings',
    paint: { 'fill-color': color, 'fill-opacity': 0.95 },
  });
  map.addLayer({ id: 'campus-building-outlines', type: 'line', source: 'campus-buildings',
    paint: { 'line-color': '#36574e', 'line-width': 1.2, 'line-opacity': 0.7 },
  });
  map.addLayer({ id: 'campus-3d-buildings', type: 'fill-extrusion', source: 'campus-buildings',
    paint: {
      'fill-extrusion-color': color,
      'fill-extrusion-height': ['coalesce', ['get', 'height'], 8],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.96,
      'fill-extrusion-vertical-gradient': true,
    },
  });
  map.addSource('selected-building', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'selected-building-halo', type: 'line', source: 'selected-building',
    paint: { 'line-color': '#fffaf0', 'line-width': 8, 'line-opacity': 1 },
  });
  map.addLayer({ id: 'selected-building-outline', type: 'line', source: 'selected-building',
    paint: { 'line-color': '#7B0832', 'line-width': 3.5, 'line-opacity': 1 },
  });
  map.addSource('campus-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'campus-route-casing', type: 'line', source: 'campus-route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 10 } });
  map.addLayer({ id: 'campus-route-line', type: 'line', source: 'campus-route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#76234c', 'line-width': 5 } });
  map.addLayer({ id: 'campus-route-direction', type: 'symbol', source: 'campus-route', layout: { 'symbol-placement': 'line', 'symbol-spacing': 80, 'text-font': ['Noto Sans Regular'], 'text-field': '›', 'text-size': 23, 'text-keep-upright': false }, paint: { 'text-color': '#fff' } });
  applyMapMode(map, mode, quality);
}

export function applyMapMode(map: Map, mode: MapMode, quality: Exclude<QualityLevel, 'auto'>) {
  if (!map.getLayer('lgln-aerial-layer')) return;
  map.setLayoutProperty('lgln-aerial-layer', 'visibility', mode === 'aerial' ? 'visible' : 'none');
  map.setPaintProperty('campus-focus-mask-fill', 'fill-opacity', mode === 'campus' ? 0.985 : mode === 'aerial' ? 0.94 : 0.62);
  map.setPaintProperty('campus-boundary-fill', 'fill-opacity', mode === 'aerial' ? 0.025 : mode === 'campus' ? 0.2 : 0.08);
  map.setPaintProperty('campus-3d-buildings', 'fill-extrusion-opacity', mode === 'aerial' ? 0.84 : quality === 'performance' ? 0.93 : 0.98);
  for (const id of ['campus-landscape-fill', 'campus-landscape-outline', 'campus-path-casing', 'campus-paths', 'campus-tree-shadows', 'campus-trees']) {
    map.setLayoutProperty(id, 'visibility', mode === 'aerial' ? 'none' : 'visible');
  }
}
