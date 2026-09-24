import type { Map } from 'maplibre-gl';
import { campusWalkways, campusLandscape, campusAmenities } from '../data/campus/landscape';

export function addLandscape(map: Map) {
  map.addSource('campus-landscape', { type: 'geojson', data: campusLandscape });
  map.addLayer({ id: 'campus-landscape-fill', type: 'fill', source: 'campus-landscape', paint: {
    'fill-color': ['match', ['get', 'category'], 'green', '#b7caaa', 'sports', '#8dbb94', 'parking', '#d7d2c6', '#dce1ca'], 'fill-opacity': 0.78,
  } });
  map.addLayer({ id: 'campus-landscape-outline', type: 'line', source: 'campus-landscape', paint: { 'line-color': '#8c9f85', 'line-width': 0.8, 'line-opacity': 0.4 } });
  map.addSource('campus-walkways', { type: 'geojson', data: campusWalkways });
  map.addLayer({ id: 'campus-path-casing', type: 'line', source: 'campus-walkways', paint: { 'line-color': '#b7b4a7', 'line-width': ['interpolate', ['linear'], ['zoom'], 15, 1, 18, 8], 'line-opacity': 0.55 } });
  map.addLayer({ id: 'campus-paths', type: 'line', source: 'campus-walkways', paint: { 'line-color': '#fffdf5', 'line-width': ['interpolate', ['linear'], ['zoom'], 15, 0.5, 18, 5.5] } });
  map.addLayer({ id: 'campus-street-labels', type: 'symbol', source: 'campus-walkways', minzoom: 15.5,
    filter: ['has', 'name'], layout: { 'symbol-placement': 'line', 'text-font': ['Noto Sans Regular'], 'text-field': ['get', 'name'], 'text-size': 11, 'symbol-spacing': 450 },
    paint: { 'text-color': '#6b756a', 'text-halo-color': '#faf8ed', 'text-halo-width': 2 } });
  map.addSource('campus-amenities', { type: 'geojson', data: campusAmenities });
  map.addLayer({ id: 'campus-tree-shadows', type: 'circle', source: 'campus-amenities', filter: ['==', ['get', 'category'], 'tree'],
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 1.5, 18, 10], 'circle-color': '#456249', 'circle-opacity': 0.14, 'circle-translate': [2, 3], 'circle-blur': 0.7 } });
  map.addLayer({ id: 'campus-trees', type: 'circle', source: 'campus-amenities', filter: ['==', ['get', 'category'], 'tree'],
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 1.2, 18, 8], 'circle-color': '#739b70', 'circle-stroke-color': '#d3dfb6', 'circle-stroke-width': 1, 'circle-opacity': 0.9 } });
  map.addLayer({ id: 'campus-small-amenities', type: 'circle', source: 'campus-amenities', minzoom: 17.5,
    filter: ['!=', ['get', 'category'], 'tree'], paint: { 'circle-radius': 4, 'circle-color': ['match', ['get', 'category'], 'entrance', '#5c7969', '#7c729c'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } });
  map.addLayer({ id: 'campus-small-amenity-labels', type: 'symbol', source: 'campus-amenities', minzoom: 18.1,
    filter: ['!=', ['get', 'category'], 'tree'], layout: { 'text-font': ['Noto Sans Regular'], 'text-field': ['match', ['get', 'category'], 'entrance', ['case', ['==', ['get', 'wheelchair'], 'yes'], 'Eingang ♿', 'Eingang'], 'bus', ['get', 'name'], 'bicycle_parking', 'Fahrräder', 'bicycle_rental', 'StadtRAD', 'toilets', 'WC', 'Parken'], 'text-size': 10, 'text-offset': [0, 1.3] },
    paint: { 'text-color': '#43584d', 'text-halo-color': '#fff', 'text-halo-width': 2 } });
}
