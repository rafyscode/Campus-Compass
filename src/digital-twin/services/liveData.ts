import type { OccupancySnapshot } from '../types/campus'

export interface CampusLiveDataProvider {
  getOccupancy(buildingId: string): Promise<OccupancySnapshot | null>
}

export function validateOccupancy(snapshot: OccupancySnapshot): OccupancySnapshot {
  if (snapshot.capacity <= 0) throw new Error('capacity must be greater than zero')
  if (snapshot.occupancy < 0 || snapshot.occupancy > snapshot.capacity) {
    throw new Error('occupancy must be between zero and capacity')
  }
  const percentage = Number(((snapshot.occupancy / snapshot.capacity) * 100).toFixed(1))
  return { ...snapshot, percentage }
}
