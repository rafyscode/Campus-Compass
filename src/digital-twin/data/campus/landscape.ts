import type { FeatureCollection, LineString, Point, Polygon } from 'geojson'
import rawWalkways from './walkways.geojson?raw'
import rawLandscape from './landscape.geojson?raw'
import rawAmenities from './amenities.geojson?raw'

export interface WalkwayProperties {
  id: string
  nodeIds: string[]
  blockedNodeIds: string[]
  highway: string
  name?: string
  access?: string
  foot?: string
  wheelchair?: string
  surface?: string
  [key: string]: unknown
}

export const campusWalkways = JSON.parse(rawWalkways) as FeatureCollection<LineString, WalkwayProperties>
export const campusLandscape = JSON.parse(rawLandscape) as FeatureCollection<Polygon, Record<string, string>>
export const campusAmenities = JSON.parse(rawAmenities) as FeatureCollection<Point, Record<string, string>>
