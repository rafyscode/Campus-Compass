import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { CampusCategory, DataConfidence } from '../../types/campus'
import rawBuildingsText from './buildings.geojson?raw'

export interface CampusBuildingProperties {
  id: string
  name: string
  shortLabel: string
  buildingNumber?: string
  category: CampusCategory
  color: string
  height: number
  heightMeters: number
  heightApproximate: boolean
  heightSource: string
  osmLevels?: number
  roofShape?: string
  description: string
  source: string
  sourceUrl: string
  confidence: DataConfidence
  geometryConfidence: 'osm-footprint' | 'plan-derived'
  osmId: string
  osmIds: string
  labelCoordinates: [number, number]
}

/** Local OSM extract: stable identities connect geometry, labels, search and selection. */
export const campusBuildings = JSON.parse(rawBuildingsText) as FeatureCollection<Polygon | MultiPolygon, CampusBuildingProperties>

export const buildingById = new Map(campusBuildings.features.map((feature) => [feature.properties.id, feature]))
