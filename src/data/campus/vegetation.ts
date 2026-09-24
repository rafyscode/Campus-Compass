import { CAMPUS_BUILDINGS } from './buildings';
import { planPixelToWorld, type WorldTuple } from './geo';

export interface TreePoint {
  x: number;
  z: number;
  scale: number;
  rotation: number;
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function pointInPolygon(x: number, z: number, polygon: readonly WorldTuple[]) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [xi, zi] = polygon[index] ?? [0, 0];
    const [xj, zj] = polygon[previous] ?? [0, 0];
    const crosses = ((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / ((zj - zi) || Number.EPSILON) + xi);
    if (crosses) inside = !inside;
  }
  return inside;
}

function collidesWithBuilding(x: number, z: number) {
  return CAMPUS_BUILDINGS.some((building) => pointInPolygon(x, z, building.footprint));
}

function scatter(seed: number, x1: number, y1: number, x2: number, y2: number, count: number): TreePoint[] {
  const random = seeded(seed);
  const result: TreePoint[] = [];
  let attempts = 0;
  const maxAttempts = count * 10;
  while (result.length < count && attempts < maxAttempts) {
    attempts += 1;
    const px = x1 + random() * (x2 - x1);
    const py = y1 + random() * (y2 - y1);
    const world = planPixelToWorld({ x: px, y: py });
    if (collidesWithBuilding(world.x, world.z)) continue;
    result.push({ x: world.x, z: world.z, scale: 0.72 + random() * 0.58, rotation: random() * Math.PI * 2 });
  }
  return result;
}

/**
 * Stylised tree groups, intentionally concentrated at edges and garden areas.
 * Exact individual tree locations are not asserted as survey data.
 */
export const CAMPUS_TREES: readonly TreePoint[] = [
  ...scatter(11, 335, 485, 405, 980, 16),        // Wichernstraße edge
  ...scatter(17, 790, 690, 925, 820, 12),        // Bibliotheksgarten
  ...scatter(29, 1450, 455, 1680, 635, 24),      // Biotopgarten
  ...scatter(41, 1405, 635, 1475, 940, 9),       // west of Central Building
  ...scatter(43, 1745, 620, 1790, 930, 8),       // Universitätsallee edge
  ...scatter(47, 720, 980, 1390, 1025, 16),      // southern campus edge
  ...scatter(53, 395, 505, 690, 545, 8),         // sparse Mensa / sports-field edge
] as const;
