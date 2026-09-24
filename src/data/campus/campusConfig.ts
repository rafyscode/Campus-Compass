export const CAMPUS_CONFIG = {
  name: 'Leuphana Universität Lüneburg · Zentraler Campus',
  address: 'Universitätsallee 1, 21335 Lüneburg',
  origin: { latitude: 53.22855, longitude: 10.40143 },
  worldBounds: { minX: -330, maxX: 315, minZ: -165, maxZ: 140 },
  camera: {
    campus: { position: [430, 360, 470], target: [-8, 0, 2] },
    mensa: { position: [-160, 118, 8], target: [-213, 0, -80] },
    central: { position: [278, 132, 128], target: [203, 10, 26] },
    top: { position: [-8, 690, 2], target: [-8, 0, 2] },
  },
  forecastStops: [0, 15, 30, 60, 90, 120] as const,
  attribution: {
    campusPlan: 'Leuphana Universität Lüneburg · Lageplan Zentraler Campus (geometric reference only)',
    openData: 'OpenStreetMap contributors · geospatial anchor validation',
  },
} as const;

export type CampusVisualMode = 'day' | 'dusk' | 'night';
export type CampusLayerKey = 'buildings' | 'occupancy' | 'forecast' | 'heatmap' | 'flow' | 'labels' | 'vegetation';
