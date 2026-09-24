import { CAMPUS_CONFIG } from './campusConfig';

const EARTH_RADIUS_M = 6_378_137;
const DEG_TO_RAD = Math.PI / 180;

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface WorldPoint {
  x: number;
  z: number;
}

export interface PlanPoint {
  x: number;
  y: number;
}

export type WorldTuple = readonly [number, number];

/**
 * Local equirectangular projection around the central campus.
 * World x = east in metres, world z = south in metres.
 */
export function geoToWorld(point: GeoPoint): WorldPoint {
  const { latitude: lat0, longitude: lon0 } = CAMPUS_CONFIG.origin;
  const x = (point.longitude - lon0) * DEG_TO_RAD * EARTH_RADIUS_M * Math.cos(lat0 * DEG_TO_RAD);
  const north = (point.latitude - lat0) * DEG_TO_RAD * EARTH_RADIUS_M;
  return { x, z: -north };
}

/**
 * Affine calibration from the supplied official campus-plan raster to the local metre world.
 * Calibration anchors: Mensa, Universitätsbibliothek and Zentralgebäude.
 * Additional lecture-hall coordinates are used as secondary plausibility checks.
 * The plan remains a geometric reference only; the original raster is not shipped in the app.
 */
export function planPixelToWorld(point: PlanPoint): WorldPoint {
  const east = 0.347796411422 * point.x + 0.091297248754 * point.y - 433.180293652019;
  const north = 0.000188420694 * point.x - 0.359851348595 * point.y + 244.265256333097;
  return { x: east, z: -north };
}

export function planFootprintToWorld(points: readonly PlanPoint[]): readonly WorldTuple[] {
  return points.map((point) => {
    const world = planPixelToWorld(point);
    return [world.x, world.z] as const;
  });
}

export function footprintCentroid(points: readonly WorldTuple[]): [number, number] {
  const sum = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]] as [number, number], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

export function footprintBounds(points: readonly WorldTuple[]) {
  const xs = points.map(([x]) => x);
  const zs = points.map(([, z]) => z);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
  };
}
