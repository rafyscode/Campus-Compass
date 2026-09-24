import { geoToWorld, planFootprintToWorld, type GeoPoint, type PlanPoint, type WorldTuple } from './geo';

export type BuildingCategory = 'dining' | 'academic' | 'library' | 'sports' | 'landmark' | 'service';
export type GeometryConfidence = 'georeferenced-anchor' | 'plan-approximation';

export interface CampusBuilding {
  id: string;
  name: string;
  shortName: string;
  number?: string;
  category: BuildingCategory;
  footprint: readonly WorldTuple[];
  heightM: number;
  heightApproximate: boolean;
  geometryConfidence: GeometryConfidence;
  important: boolean;
  interactive: boolean;
  sensorReady: boolean;
  geoAnchor?: GeoPoint;
  description: string;
}

function footprint(points: readonly PlanPoint[]) {
  return planFootprintToWorld(points);
}

function rectangle(x1: number, y1: number, x2: number, y2: number) {
  return footprint([{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }]);
}

const MENSA_GEO = { latitude: 53.22927, longitude: 10.39824 } as const;
const LIBRARY_GEO = { latitude: 53.22782, longitude: 10.40121 } as const;
const BUILDING_9_GEO = { latitude: 53.22851, longitude: 10.40123 } as const;
const CENTRAL_GEO = { latitude: 53.22832, longitude: 10.40448 } as const;

export const CAMPUS_BUILDINGS: readonly CampusBuilding[] = [
  {
    id: '1', name: 'Gebäude 1', shortName: 'C1', number: '1', category: 'academic',
    footprint: rectangle(300, 333, 352, 472), heightM: 13, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Historischer Campusbau an der Wichernstraße.',
  },
  {
    id: 'mensa', name: 'Mensa', shortName: 'Mensa', number: '3', category: 'dining',
    footprint: footprint([{ x: 430, y: 401 }, { x: 676, y: 401 }, { x: 676, y: 451 }, { x: 649, y: 451 }, { x: 649, y: 471 }, { x: 488, y: 471 }, { x: 488, y: 493 }, { x: 430, y: 493 }, { x: 430, y: 477 }, { x: 414, y: 477 }, { x: 414, y: 445 }, { x: 430, y: 445 }]),
    heightM: 8, heightApproximate: true, geometryConfidence: 'georeferenced-anchor', important: true, interactive: true, sensorReady: true, geoAnchor: MENSA_GEO,
    description: 'Zentrales Datenobjekt von Campus Compass.',
  },
  {
    id: '28', name: 'Gebäude 28', shortName: 'C28', number: '28', category: 'academic',
    footprint: rectangle(600, 316, 664, 382), heightM: 10, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Gebäude im nordwestlichen Campusbereich.',
  },
  {
    id: '4', name: 'Gebäude 4', shortName: 'C4', number: '4', category: 'academic',
    footprint: rectangle(710, 322, 758, 446), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Langbau entlang der nördlichen Campusachse.',
  },
  {
    id: '6', name: 'Gebäude 6', shortName: 'C6', number: '6', category: 'academic',
    footprint: rectangle(845, 318, 893, 446), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Langbau entlang der nördlichen Campusachse.',
  },
  {
    id: '8', name: 'Gebäude 8 · Infoportal', shortName: 'C8', number: '8', category: 'service',
    footprint: rectangle(1013, 390, 1090, 431), heightM: 10, heightApproximate: true, geometryConfidence: 'plan-approximation', important: true, interactive: true, sensorReady: false,
    description: 'Infoportal und zentrale Servicefunktionen im nördlichen Campusbereich.',
  },
  {
    id: '10', name: 'Gebäude 10', shortName: 'C10', number: '10', category: 'academic',
    footprint: rectangle(1192, 305, 1242, 450), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Langbau entlang der nördlichen Campusachse.',
  },
  {
    id: '12', name: 'Gebäude 12', shortName: 'C12', number: '12', category: 'academic',
    footprint: rectangle(1322, 296, 1370, 445), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Langbau entlang der nördlichen Campusachse.',
  },
  {
    id: '14', name: 'Gebäude 14', shortName: 'C14', number: '14', category: 'academic',
    footprint: rectangle(1468, 364, 1617, 402), heightM: 10, heightApproximate: true, geometryConfidence: 'plan-approximation', important: true, interactive: true, sensorReady: false,
    description: 'Gebäude im Nordosten des zentralen Campus.',
  },
  {
    id: '5', name: 'Gebäude 5', shortName: 'C5', number: '5', category: 'academic',
    footprint: rectangle(720, 529, 773, 688), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Historischer Langbau am Bibliotheksgarten.',
  },
  {
    id: '7', name: 'Gebäude 7', shortName: 'C7', number: '7', category: 'academic',
    footprint: rectangle(852, 527, 905, 681), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Historischer Langbau am Bibliotheksgarten.',
  },
  {
    id: '9', name: 'Gebäude 9 · Hörsäle 1–4', shortName: 'C9 / HS', number: '9', category: 'academic',
    footprint: footprint([{ x: 1002, y: 531 }, { x: 1106, y: 531 }, { x: 1106, y: 576 }, { x: 1081, y: 576 }, { x: 1081, y: 598 }, { x: 1120, y: 598 }, { x: 1120, y: 660 }, { x: 1091, y: 660 }, { x: 1091, y: 681 }, { x: 1120, y: 681 }, { x: 1120, y: 783 }, { x: 1002, y: 783 }, { x: 1002, y: 687 }, { x: 973, y: 687 }, { x: 973, y: 660 }, { x: 958, y: 660 }, { x: 958, y: 598 }, { x: 1002, y: 598 }]),
    heightM: 13, heightApproximate: true, geometryConfidence: 'georeferenced-anchor', important: true, interactive: true, sensorReady: false, geoAnchor: BUILDING_9_GEO,
    description: 'Hörsaalkomplex im Zentrum des Campus.',
  },
  {
    id: '11', name: 'Gebäude 11', shortName: 'C11', number: '11', category: 'academic',
    footprint: rectangle(1204, 522, 1251, 693), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Langbau östlich des Hörsaalkomplexes.',
  },
  {
    id: '41', name: 'Hörsaal 5 · Gebäude 41', shortName: 'HS 5', number: '41', category: 'academic',
    footprint: footprint([{ x: 1260, y: 560 }, { x: 1320, y: 560 }, { x: 1320, y: 612 }, { x: 1308, y: 612 }, { x: 1308, y: 678 }, { x: 1264, y: 678 }, { x: 1264, y: 612 }, { x: 1260, y: 612 }]),
    heightM: 10, heightApproximate: true, geometryConfidence: 'plan-approximation', important: true, interactive: true, sensorReady: false,
    description: 'Kompakter Hörsaalbau zwischen Gebäude 11 und 13.',
  },
  {
    id: '13', name: 'Gebäude 13', shortName: 'C13', number: '13', category: 'academic',
    footprint: rectangle(1339, 516, 1392, 695), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Langbau östlich des Hörsaalkomplexes.',
  },
  {
    id: '16', name: 'Gebäude 16', shortName: 'C16', number: '16', category: 'academic',
    footprint: rectangle(1700, 492, 1750, 643), heightM: 14, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Gebäude an der Universitätsallee.',
  },
  {
    id: 'library', name: 'Universitätsbibliothek', shortName: 'Bibliothek', category: 'library',
    footprint: footprint([{ x: 900, y: 826 }, { x: 1179, y: 816 }, { x: 1179, y: 965 }, { x: 920, y: 974 }, { x: 920, y: 953 }, { x: 864, y: 953 }, { x: 864, y: 877 }, { x: 900, y: 877 }]),
    heightM: 12, heightApproximate: true, geometryConfidence: 'georeferenced-anchor', important: true, interactive: true, sensorReady: true, geoAnchor: LIBRARY_GEO,
    description: 'Universitätsbibliothek und Lernort am südlichen Campus.',
  },
  {
    id: '20', name: 'Sporthalle', shortName: 'Sporthalle', number: '20', category: 'sports',
    footprint: rectangle(543, 928, 684, 1000), heightM: 10, heightApproximate: true, geometryConfidence: 'plan-approximation', important: true, interactive: true, sensorReady: false,
    description: 'Sporthalle am südwestlichen Campus.',
  },
  {
    id: '21', name: 'Studio 21', shortName: 'Studio 21', number: '21', category: 'sports',
    footprint: rectangle(730, 777, 778, 997), heightM: 12, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Hochschulsport am Bibliotheksgarten.',
  },
  {
    id: '22', name: 'Gebäude 22', shortName: 'C22', number: '22', category: 'service',
    footprint: rectangle(815, 914, 850, 959), heightM: 8, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Kleiner Campusbau nahe der Bibliothek.',
  },
  {
    id: '25', name: 'Gebäude 25', shortName: 'C25', number: '25', category: 'academic',
    footprint: rectangle(1197, 706, 1254, 956), heightM: 15, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Langbau westlich des Zentralgebäudes.',
  },
  {
    id: '27', name: 'Gebäude 27', shortName: 'C27', number: '27', category: 'service',
    footprint: rectangle(1358, 856, 1392, 956), heightM: 11, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Kleiner Campusbau südlich des Parkplatzes P1.',
  },
  {
    id: 'central', name: 'Zentralgebäude', shortName: 'Zentralgebäude', number: '40', category: 'landmark',
    footprint: footprint([{ x: 1521, y: 681 }, { x: 1600, y: 681 }, { x: 1614, y: 660 }, { x: 1705, y: 676 }, { x: 1717, y: 701 }, { x: 1768, y: 716 }, { x: 1742, y: 753 }, { x: 1750, y: 862 }, { x: 1672, y: 875 }, { x: 1660, y: 792 }, { x: 1608, y: 826 }, { x: 1585, y: 767 }, { x: 1554, y: 810 }, { x: 1518, y: 748 }, { x: 1478, y: 714 }]),
    heightM: 36.75, heightApproximate: false, geometryConfidence: 'georeferenced-anchor', important: true, interactive: true, sensorReady: true, geoAnchor: CENTRAL_GEO,
    description: 'Daniel-Libeskind-Bau. Die Web-Geometrie abstrahiert den gestaffelten, kantigen Baukörper; 36,75 m maximale Gebäudehöhe sind im offiziellen Leuphana-Factsheet publiziert.',
  },
  {
    id: '26', name: 'Gebäude 26', shortName: 'C26', number: '26', category: 'service',
    footprint: rectangle(1507, 878, 1638, 920), heightM: 9, heightApproximate: true, geometryConfidence: 'plan-approximation', important: false, interactive: true, sensorReady: false,
    description: 'Gebäude südlich des Zentralgebäudes.',
  },
] as const;

export const BUILDING_BY_ID = new Map(CAMPUS_BUILDINGS.map((building) => [building.id, building]));

export const GEO_VALIDATION = {
  mensa: geoToWorld(MENSA_GEO),
  library: geoToWorld(LIBRARY_GEO),
  building9: geoToWorld(BUILDING_9_GEO),
  central: geoToWorld(CENTRAL_GEO),
} as const;
