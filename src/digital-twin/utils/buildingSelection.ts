import type { MapGeoJSONFeature } from 'maplibre-gl'
import type { Position } from 'geojson'
import type { CampusPoi } from '../types/campus'

type BuildingFeature = Pick<MapGeoJSONFeature, 'geometry' | 'properties'>
type PointLocation = 'inside' | 'outside' | 'boundary'

// A very small coordinate tolerance, not a proximity-based identity heuristic.
const EPSILON = 1e-10

function locationInRing(point: Position, ring: Position[]): PointLocation {
  if (ring.length < 3) return 'outside'
  let inside = false
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const a = ring[previous]
    const b = ring[index]
    if (![a[0], a[1], b[0], b[1]].every(Number.isFinite)) return 'outside'
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const length = Math.hypot(dx, dy)
    if (length > 0) {
      const cross = (point[0] - a[0]) * dy - (point[1] - a[1]) * dx
      const along = ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length
      if (Math.abs(cross) <= EPSILON * length && along >= -EPSILON && along <= length + EPSILON) {
        return 'boundary'
      }
    }
    if ((a[1] > point[1]) !== (b[1] > point[1]) &&
      point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) {
      inside = !inside
    }
  }
  return inside ? 'inside' : 'outside'
}

function insideFootprint(point: Position, polygon: Position[][]): boolean {
  if (!polygon[0] || locationInRing(point, polygon[0]) !== 'inside') return false
  return polygon.slice(1).every((hole) => locationInRing(point, hole) === 'outside')
}

/**
 * Identify only an unambiguous building POI contained by the rendered footprint.
 * Boundary points, courtyards and nearby POIs deliberately do not establish
 * identity. This avoids assigning Mensa occupancy to a neighboring building.
 */
export function findBuildingPoi(feature: BuildingFeature, pois: readonly CampusPoi[]): CampusPoi | undefined {
  const geometry = feature.geometry
  const polygons = geometry.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates : []
  const candidates = pois.filter((poi) =>
    poi.category !== 'green' && poi.category !== 'transport' &&
    poi.coordinates.every(Number.isFinite) &&
    polygons.some((polygon) => insideFootprint(poi.coordinates, polygon)),
  )
  return candidates.length === 1 ? candidates[0] : undefined
}

function positiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined
  if (typeof value === 'string' && value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

/** Return a documented POI height or a usable tile height; invent no fallback. */
export function getBuildingHeight(feature: BuildingFeature, poi?: CampusPoi): number | undefined {
  const knownHeight = positiveNumber(poi?.heightMeters)
  if (knownHeight !== undefined) return knownHeight
  const renderedHeight = positiveNumber(feature.properties?.render_height)
  if (renderedHeight !== undefined) return renderedHeight
  const levels = positiveNumber(feature.properties?.levels)
  return levels === undefined ? undefined : levels * 3.2
}
