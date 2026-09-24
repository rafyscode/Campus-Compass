import { planFootprintToWorld, planPixelToWorld, type PlanPoint, type WorldTuple } from './geo';

export interface CampusArea {
  id: string;
  label?: string;
  kind: 'grass' | 'sports' | 'garden' | 'plaza' | 'parking';
  polygon: readonly WorldTuple[];
}

export interface CampusPath {
  id: string;
  kind: 'road' | 'walk';
  widthM: number;
  points: readonly WorldTuple[];
}

const p = (x: number, y: number) => planPixelToWorld({ x, y });
const path = (points: readonly PlanPoint[]) => points.map((point) => {
  const world = p(point.x, point.y);
  return [world.x, world.z] as const;
});

export const CAMPUS_AREAS: readonly CampusArea[] = [
  { id: 'sports-field', label: 'Sportrasen', kind: 'sports', polygon: planFootprintToWorld([{ x: 390, y: 548 }, { x: 685, y: 548 }, { x: 685, y: 815 }, { x: 430, y: 840 }]) },
  { id: 'library-garden', label: 'Bibliotheksgarten', kind: 'grass', polygon: planFootprintToWorld([{ x: 786, y: 703 }, { x: 934, y: 703 }, { x: 934, y: 826 }, { x: 786, y: 840 }]) },
  { id: 'biotope', label: 'Biotopgarten', kind: 'garden', polygon: planFootprintToWorld([{ x: 1434, y: 445 }, { x: 1697, y: 445 }, { x: 1697, y: 652 }, { x: 1434, y: 652 }]) },
  { id: 'central-plaza', kind: 'plaza', polygon: planFootprintToWorld([{ x: 1427, y: 650 }, { x: 1773, y: 650 }, { x: 1781, y: 930 }, { x: 1415, y: 930 }]) },
  { id: 'p1', label: 'P1', kind: 'parking', polygon: planFootprintToWorld([{ x: 1248, y: 716 }, { x: 1389, y: 716 }, { x: 1389, y: 944 }, { x: 1248, y: 944 }]) },
  { id: 'p3', label: 'P3', kind: 'parking', polygon: planFootprintToWorld([{ x: 403, y: 302 }, { x: 600, y: 302 }, { x: 600, y: 385 }, { x: 403, y: 385 }]) },
  { id: 'p4', label: 'P4', kind: 'parking', polygon: planFootprintToWorld([{ x: 505, y: 803 }, { x: 684, y: 803 }, { x: 684, y: 927 }, { x: 505, y: 927 }]) },
] as const;

export const CAMPUS_PATHS: readonly CampusPath[] = [
  { id: 'scharnhorst', kind: 'road', widthM: 12, points: path([{ x: 200, y: 277 }, { x: 1784, y: 236 }]) },
  { id: 'cvo', kind: 'road', widthM: 10, points: path([{ x: 700, y: 1039 }, { x: 1830, y: 1010 }]) },
  { id: 'universitaetsallee', kind: 'road', widthM: 11, points: path([{ x: 1791, y: 208 }, { x: 1826, y: 1090 }]) },
  { id: 'wichern', kind: 'road', widthM: 9, points: path([{ x: 289, y: 303 }, { x: 459, y: 1090 }]) },
  { id: 'north-spine', kind: 'walk', widthM: 5.5, points: path([{ x: 430, y: 506 }, { x: 1689, y: 438 }]) },
  { id: 'middle-spine', kind: 'walk', widthM: 5.5, points: path([{ x: 690, y: 703 }, { x: 1734, y: 650 }]) },
  { id: 'south-spine', kind: 'walk', widthM: 5, points: path([{ x: 692, y: 1002 }, { x: 1780, y: 965 }]) },
  { id: 'axis-4', kind: 'walk', widthM: 4.5, points: path([{ x: 690, y: 289 }, { x: 709, y: 1006 }]) },
  { id: 'axis-6', kind: 'walk', widthM: 4.5, points: path([{ x: 914, y: 286 }, { x: 933, y: 831 }]) },
  { id: 'axis-10', kind: 'walk', widthM: 4.5, points: path([{ x: 1166, y: 275 }, { x: 1179, y: 1007 }]) },
  { id: 'axis-12', kind: 'walk', widthM: 4.5, points: path([{ x: 1400, y: 264 }, { x: 1412, y: 991 }]) },
] as const;
