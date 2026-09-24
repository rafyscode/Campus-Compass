import type { ExpressionSpecification, FillExtrusionLayerSpecification, Map } from 'maplibre-gl'
import type { FeatureCollection, Geometry, Polygon } from 'geojson'
import campusBoundaryText from '../data/campus/campus-boundary.geojson?raw'
import poiGeoJsonText from '../data/campus/poi.geojson?raw'
import type { MapMode, QualityLevel } from '../types/campus'
import { campusPois } from '../data/campus/pois'
import { findBuildingPoi, getBuildingHeight } from '../utils/buildingSelection'

const campusBoundary = JSON.parse(campusBoundaryText) as FeatureCollection<Geometry>
const poiGeoJson = JSON.parse(poiGeoJsonText) as FeatureCollection<Geometry>

const campusRing = ((campusBoundary.features[0]?.geometry as Polygon | undefined)?.coordinates?.[0] ?? []) as number[][]

const campusFocusMask: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'campus-focus-mask' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [10.3925, 53.2240],
            [10.4090, 53.2240],
            [10.4090, 53.2330],
            [10.3925, 53.2330],
            [10.3925, 53.2240],
          ],
          campusRing,
        ],
      },
    },
  ],
}

// Keep these colors aligned with the visible legend. Vector building tiles do
// not provide reliable names: known categories are assigned by containment.
const categoryColors: Record<string, string> = {
  landmark: '#8c6d7b',
  library: '#6f8798',
  food: '#b98568',
}
const genericBuildingColor = '#c7b9a7'

const heightExpression: ExpressionSpecification = [
  'coalesce',
  ['feature-state', 'campusHeight'],
  [
    'case',
    ['>', ['to-number', ['get', 'render_height'], 0], 0],
    ['to-number', ['get', 'render_height'], 8],
    8,
  ],
]

const minHeightExpression: ExpressionSpecification = [
  'max',
  0,
  ['to-number', ['get', 'render_min_height'], 0],
]

const buildingColorExpression: ExpressionSpecification = [
  'coalesce',
  ['feature-state', 'campusColor'],
  genericBuildingColor,
]

const outsideMaskOpacityByMode: Record<MapMode, number> = {
  campus: 0.975,
  standard: 0,
  aerial: 0.93,
}


const boundaryFillOpacityByMode: Record<MapMode, number> = {
  campus: 0.16,
  standard: 0.05,
  aerial: 0.06,
}

const boundaryInnerOpacityByMode: Record<MapMode, number> = {
  campus: 0.98,
  standard: 0.55,
  aerial: 0.68,
}

const boundaryOuterOpacityByMode: Record<MapMode, number> = {
  campus: 0.78,
  standard: 0.22,
  aerial: 0.28,
}

const boundaryLabelOpacityByMode: Record<MapMode, number> = {
  campus: 0.9,
  standard: 0.46,
  aerial: 0.58,
}

export function addCampusLayers(map: Map, quality: Exclude<QualityLevel, 'auto'>, mapMode: MapMode = 'campus') {
  hideFlatBuildingLayers(map)

  const labelLayerId = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id

  map.addSource('lgln-aerial', {
    type: 'raster',
    tiles: [
      'https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ni_dop20&STYLES=&FORMAT=image/png&TRANSPARENT=FALSE&CRS=EPSG:3857&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}',
    ],
    tileSize: 512,
    minzoom: 8,
    maxzoom: 20,
    attribution: '© GeoBasis-DE/LGLN 2026',
  })
  map.addLayer({
    id: 'lgln-aerial-layer',
    type: 'raster',
    source: 'lgln-aerial',
    layout: {
      visibility: mapMode === 'aerial' ? 'visible' : 'none',
    },
    paint: {
      'raster-opacity': 0.98,
      'raster-saturation': -0.08,
      'raster-contrast': 0.04,
    },
  }, labelLayerId)

  const buildingLayer: FillExtrusionLayerSpecification = {
    id: 'campus-3d-buildings',
    type: 'fill-extrusion',
    source: 'openmaptiles',
    'source-layer': 'building',
    minzoom: quality === 'performance' ? 15.15 : 14.4,
    filter: ['!', ['in', ['to-string', ['get', 'hide_3d']], ['literal', ['true', '1']]]],
    paint: {
      'fill-extrusion-color': buildingColorExpression,
      'fill-extrusion-height': heightExpression,
      'fill-extrusion-base': minHeightExpression,
      'fill-extrusion-opacity': mapMode === 'aerial'
        ? 0.78
        : quality === 'high' ? 0.95 : quality === 'balanced' ? 0.92 : 0.87,
      'fill-extrusion-vertical-gradient': true,
    },
  }

  map.addLayer(buildingLayer, labelLayerId)

  // In Campus mode the real campus remains fully visible, while the surrounding
  // city is visually pushed back. The polygon contains the campus ring as a hole,
  // so the mask only covers geometry outside the campus boundary.
  map.addSource('campus-focus-mask', {
    type: 'geojson',
    data: campusFocusMask,
  })
  map.addLayer({
    id: 'campus-focus-mask-fill',
    type: 'fill',
    source: 'campus-focus-mask',
    layout: {
      visibility: mapMode === 'standard' ? 'none' : 'visible',
    },
    paint: {
      'fill-color': '#ffffff',
      'fill-opacity': outsideMaskOpacityByMode[mapMode],
    },
  })

  map.addSource('campus-boundary', {
    type: 'geojson',
    data: campusBoundary,
  })
  map.addLayer(
    {
      id: 'campus-boundary-fill',
      type: 'fill',
      source: 'campus-boundary',
      paint: {
        'fill-color': '#8fa37f',
        'fill-opacity': boundaryFillOpacityByMode[mapMode],
      },
    },
    'campus-3d-buildings',
  )
  map.addLayer({
    id: 'campus-boundary-line-outer',
    type: 'line',
    source: 'campus-boundary',
    paint: {
      'line-color': '#fffaf0',
      'line-width': mapMode === 'campus' ? 8 : 4,
      'line-opacity': boundaryOuterOpacityByMode[mapMode],
      'line-blur': mapMode === 'campus' ? 0.5 : 0.25,
    },
  })
  map.addLayer({
    id: 'campus-boundary-line',
    type: 'line',
    source: 'campus-boundary',
    paint: {
      'line-color': '#4f6451',
      'line-width': mapMode === 'campus' ? 3 : 1.6,
      'line-dasharray': [2, 1.6],
      'line-opacity': boundaryInnerOpacityByMode[mapMode],
    },
  })
  map.addLayer({
    id: 'campus-boundary-label',
    type: 'symbol',
    source: 'campus-boundary',
    minzoom: 15,
    layout: {
      'symbol-placement': 'line-center',
      'text-field': 'Leuphana Campus',
      'text-font': ['Noto Sans Bold'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 15, 11, 18, 13],
      'symbol-spacing': 350,
      'text-letter-spacing': 0.08,
      'text-padding': 8,
    },
    paint: {
      'text-color': '#324133',
      'text-halo-color': 'rgba(255,250,240,0.95)',
      'text-halo-width': 1.5,
      'text-opacity': boundaryLabelOpacityByMode[mapMode],
    },
  })

  map.addSource('campus-pois', {
    type: 'geojson',
    data: poiGeoJson,
  })
  map.addLayer({
    id: 'campus-poi-dots',
    type: 'circle',
    source: 'campus-pois',
    minzoom: 15.2,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 15.2, 2.5, 18, 4.5],
      'circle-color': ['match', ['get', 'category'],
        'landmark', categoryColors.landmark,
        'library', categoryColors.library,
        'food', categoryColors.food,
        genericBuildingColor,
      ],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.2,
      'circle-opacity': 0.88,
    },
  })
  map.addLayer({
    id: 'campus-poi-labels',
    type: 'symbol',
    source: 'campus-pois',
    minzoom: 15.8,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 15.8, 10.5, 18, 12.5],
      'text-offset': [0, 1.1],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-padding': 6,
    },
    paint: {
      'text-color': '#263029',
      'text-halo-color': 'rgba(250,248,243,0.95)',
      'text-halo-width': 1.6,
    },
  })

  map.addSource('selected-building', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer({
    id: 'selected-building-extrusion',
    type: 'fill-extrusion',
    source: 'selected-building',
    paint: {
      'fill-extrusion-color': '#71846d',
      'fill-extrusion-height': ['coalesce', ['get', '__height'], 8],
      'fill-extrusion-base': ['coalesce', ['get', '__base'], 0],
      'fill-extrusion-opacity': 0.74,
    },
  }, labelLayerId)

  identifyKnownBuildings(map)
}

function identifyKnownBuildings(map: Map) {
  const assigned = new Set<string>()
  const update = () => {
    if (!map.getSource('openmaptiles')) return
    for (const feature of map.querySourceFeatures('openmaptiles', { sourceLayer: 'building' })) {
      if (feature.id === undefined || feature.id === null) continue
      if (['true', '1'].includes(String(feature.properties?.hide_3d))) continue
      const key = `${typeof feature.id}:${feature.id}`
      if (assigned.has(key)) continue
      const poi = findBuildingPoi(feature, campusPois)
      if (!poi) continue
      const height = getBuildingHeight(feature, poi)
      map.setFeatureState({ source: 'openmaptiles', sourceLayer: 'building', id: feature.id }, {
        campusColor: categoryColors[poi.category] ?? genericBuildingColor,
        ...(height === undefined ? {} : { campusHeight: height }),
      })
      assigned.add(key)
    }
  }
  // Tile loading and camera changes settle before querying. Only new matches
  // change feature state, so the resulting redraw cannot cause an idle loop.
  map.on('idle', update)
  map.once('remove', () => { map.off('idle', update) })
}

export function applyMapMode(map: Map, mode: MapMode, quality: Exclude<QualityLevel, 'auto'>) {
  if (!map.getLayer('lgln-aerial-layer')) return

  map.setLayoutProperty('lgln-aerial-layer', 'visibility', mode === 'aerial' ? 'visible' : 'none')
  map.setLayoutProperty('campus-focus-mask-fill', 'visibility', mode === 'standard' ? 'none' : 'visible')
  map.setPaintProperty('campus-focus-mask-fill', 'fill-opacity', outsideMaskOpacityByMode[mode])

  const buildingOpacity = mode === 'aerial'
    ? 0.78
    : quality === 'high' ? 0.95 : quality === 'balanced' ? 0.92 : 0.87

  map.setPaintProperty('campus-3d-buildings', 'fill-extrusion-opacity', buildingOpacity)
  map.setPaintProperty('campus-boundary-fill', 'fill-opacity', boundaryFillOpacityByMode[mode])
  map.setPaintProperty('campus-boundary-line-outer', 'line-width', mode === 'campus' ? 8 : 4)
  map.setPaintProperty('campus-boundary-line-outer', 'line-opacity', boundaryOuterOpacityByMode[mode])
  map.setPaintProperty('campus-boundary-line', 'line-width', mode === 'campus' ? 3 : 1.6)
  map.setPaintProperty('campus-boundary-line', 'line-opacity', boundaryInnerOpacityByMode[mode])
  map.setPaintProperty('campus-boundary-label', 'text-opacity', boundaryLabelOpacityByMode[mode])
}

function hideFlatBuildingLayers(map: Map) {
  for (const layer of map.getStyle().layers ?? []) {
    if (
      layer.id !== 'campus-3d-buildings' &&
      'source-layer' in layer &&
      layer['source-layer'] === 'building' &&
      layer.type === 'fill'
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
    }
  }
}
