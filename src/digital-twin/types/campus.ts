export type DataConfidence = 'verified' | 'derived' | 'estimated'

export type CampusCategory =
  | 'landmark'
  | 'food'
  | 'library'
  | 'teaching'
  | 'administration'
  | 'student-life'
  | 'green'
  | 'transport'
  | 'sports'

export interface CampusPoi {
  id: string
  name: string
  shortLabel?: string
  color?: string
  buildingNumber?: string
  category: CampusCategory
  description: string
  coordinates: [number, number]
  source: string
  sourceUrl?: string
  confidence: DataConfidence
  heightMeters?: number
  osmId?: string
}

export interface BuildingSelection {
  id: string
  name: string
  shortLabel?: string
  color?: string
  buildingNumber?: string
  category: CampusCategory | 'building'
  description: string
  coordinates: [number, number]
  source: string
  confidence: DataConfidence
  heightMeters?: number
  properties?: Record<string, unknown>
}

export type QualityLevel = 'auto' | 'high' | 'balanced' | 'performance'
export type MapMode = 'campus' | 'standard' | 'aerial'

export interface OccupancySnapshot {
  buildingId: string
  occupancy: number
  capacity: number
  percentage: number
  status: 'low' | 'medium' | 'high' | 'full'
  updatedAt: string
}
