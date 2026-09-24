import distance from '@turf/distance'
import { point } from '@turf/helpers'
import type { CampusPoi } from '../types/campus'

export function nearestPoi(
  coordinates: [number, number],
  pois: CampusPoi[],
  maxDistanceMeters = 55,
): CampusPoi | null {
  const origin = point(coordinates)
  let nearest: CampusPoi | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const poi of pois) {
    const meters = distance(origin, point(poi.coordinates), { units: 'kilometers' }) * 1000
    if (meters < nearestDistance) {
      nearestDistance = meters
      nearest = poi
    }
  }

  return nearestDistance <= maxDistanceMeters ? nearest : null
}
