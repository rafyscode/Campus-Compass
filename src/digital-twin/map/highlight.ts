import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import type { GeoJSONSource, Map, MapGeoJSONFeature } from 'maplibre-gl'
import { campusPois } from '../data/campus/pois'
import { findBuildingPoi, getBuildingHeight } from '../utils/buildingSelection'

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] }

function numeric(value: unknown, fallback: number) {
  if (typeof value !== 'number' && typeof value !== 'string') return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export function clearBuildingHighlight(map: Map) {
  const source = map.getSource('selected-building') as GeoJSONSource | undefined
  source?.setData(EMPTY)
}

export function highlightBuildingFeature(map: Map, feature: MapGeoJSONFeature) {
  const source = map.getSource('selected-building') as GeoJSONSource | undefined
  if (!source) return

  const props = { ...(feature.properties ?? {}) } as GeoJsonProperties & Record<string, unknown>
  const poi = findBuildingPoi(feature, campusPois)
  const height = getBuildingHeight(feature, poi) ?? 8
  props.__height = height
  props.__base = Math.min(height, numeric(props?.render_min_height, 0))

  const copy: Feature<Geometry> = {
    type: 'Feature',
    geometry: feature.geometry as Geometry,
    properties: props,
  }
  source.setData({ type: 'FeatureCollection', features: [copy] })
}
