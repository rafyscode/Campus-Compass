import type { FeatureCollection, Point } from 'geojson'
import rawPoisText from './poi.geojson?raw'
import type { CampusPoi, CampusCategory, DataConfidence } from '../../types/campus'

interface PoiProperties {
  id: string
  name: string
  shortLabel?: string
  color?: string
  buildingNumber?: string
  category: CampusCategory
  description: string
  source: string
  confidence: DataConfidence
  heightMeters?: number
  osmId?: string
}

const data = JSON.parse(rawPoisText) as FeatureCollection<Point, PoiProperties>

export const campusPois: CampusPoi[] = data.features.map((feature) => ({
  ...feature.properties,
  coordinates: feature.geometry.coordinates as [number, number],
}))

export const searchablePois = campusPois.map((poi) => ({
  ...poi,
  searchText: [poi.name, poi.shortLabel, poi.buildingNumber ? `Gebäude ${poi.buildingNumber} C${poi.buildingNumber} C ${poi.buildingNumber}` : '', poi.category]
    .join(' ')
    .toLocaleLowerCase('de-DE'),
}))
