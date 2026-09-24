export const CAMPUS_CENTER: [number, number] = [10.40145, 53.22872]

// Extent of the campus-boundary GeoJSON supplied with the digital twin.
export const CAMPUS_BOUNDS: [[number, number], [number, number]] = [[10.39600, 53.22708], [10.40605, 53.23028]]

export const HOME_CAMERA = {
  center: CAMPUS_CENTER,
  zoom: 16.25,
  pitch: 56,
  bearing: -19,
} as const

export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
