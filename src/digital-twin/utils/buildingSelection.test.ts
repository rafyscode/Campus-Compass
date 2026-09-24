import { describe, expect, it } from 'vitest'
import type { Geometry, Position } from 'geojson'
import type { CampusPoi } from '../types/campus'
import { findBuildingPoi, getBuildingHeight } from './buildingSelection'

function square(x: number, y: number, size = 0.001): Position[] {
  return [[x, y], [x + size, y], [x + size, y + size], [x, y + size], [x, y]]
}

function feature(geometry: Geometry, properties: Record<string, unknown> = {}) {
  return { geometry, properties }
}

function poi(id: string, coordinates: [number, number], extra: Partial<CampusPoi> = {}): CampusPoi {
  return { id, coordinates, name: id, category: 'food', description: '', source: 'test', confidence: 'derived', ...extra }
}

const mensa = poi('mensa', [10.39826, 53.22927])
const mensaFootprint = feature({ type: 'Polygon', coordinates: [square(10.398, 53.229)] })

describe('building identity from polygon containment', () => {
  it('selects a contained Mensa POI without relying on names or tile properties', () => {
    expect(findBuildingPoi(mensaFootprint, [mensa])).toBe(mensa)
  })

  it('does not give a neighboring building Mensa occupancy even within 55 metres', () => {
    const neighbor = feature({ type: 'Polygon', coordinates: [square(10.3978, 53.2292, 0.0002)] })
    expect(findBuildingPoi(neighbor, [mensa])).toBeUndefined()
  })

  it('excludes a courtyard hole and its boundary regardless of winding', () => {
    const courtyard = square(10.3981, 53.2291, 0.0004)
    const building = feature({ type: 'Polygon', coordinates: [square(10.398, 53.229).reverse(), courtyard] })
    expect(findBuildingPoi(building, [mensa])).toBeUndefined()
    expect(findBuildingPoi(building, [poi('edge', [10.3981, 53.2293])])).toBeUndefined()
    const occupiedWing = poi('wing', [10.3988, 53.2298])
    expect(findBuildingPoi(building, [occupiedWing])).toBe(occupiedWing)
  })

  it('matches a POI in any multipolygon component', () => {
    const building = feature({ type: 'MultiPolygon', coordinates: [[square(10.39, 53.22)], [square(10.398, 53.229)]] })
    expect(findBuildingPoi(building, [mensa])).toBe(mensa)
  })

  it('refuses ambiguous buildings with multiple contained POIs', () => {
    expect(findBuildingPoi(mensaFootprint, [mensa, poi('cafe', [10.3985, 53.2295])])).toBeUndefined()
  })

  it('excludes green-space and transport anchors from building identity', () => {
    expect(findBuildingPoi(mensaFootprint, [
      poi('garden', mensa.coordinates, { category: 'green' }),
      poi('bus', mensa.coordinates, { category: 'transport' }),
    ])).toBeUndefined()
  })

  it('does not establish identity from a boundary point shared by buildings', () => {
    expect(findBuildingPoi(mensaFootprint, [poi('edge', [10.398, 53.2295])])).toBeUndefined()
    expect(findBuildingPoi(mensaFootprint, [poi('vertex', [10.398, 53.229])])).toBeUndefined()
  })

  it('returns no match for unsupported, empty or invalid geometry and invalid coordinates', () => {
    expect(findBuildingPoi(feature({ type: 'Point', coordinates: mensa.coordinates }), [mensa])).toBeUndefined()
    expect(findBuildingPoi(feature({ type: 'Polygon', coordinates: [] }), [mensa])).toBeUndefined()
    expect(findBuildingPoi(feature({ type: 'Polygon', coordinates: [[[NaN, 1], [1, 2], [2, 1]]] }), [mensa])).toBeUndefined()
    expect(findBuildingPoi(mensaFootprint, [poi('invalid', [NaN, 53.229])])).toBeUndefined()
  })
})

describe('building height source selection', () => {
  it('uses a documented POI height before approximate tile height', () => {
    expect(getBuildingHeight({ ...mensaFootprint, properties: { render_height: 30 } }, { ...mensa, heightMeters: 36.75 })).toBe(36.75)
  })

  it('accepts numeric tile values and derives from levels when necessary', () => {
    expect(getBuildingHeight({ ...mensaFootprint, properties: { render_height: '12.5' } })).toBe(12.5)
    expect(getBuildingHeight({ ...mensaFootprint, properties: { render_height: null, levels: '3' } })).toBeCloseTo(9.6)
  })

  it('does not invent a zero or default height from absent or invalid values', () => {
    for (const value of [undefined, null, '', false, -1, 0, NaN, Infinity, 'unknown']) {
      expect(getBuildingHeight({ ...mensaFootprint, properties: { render_height: value, levels: value } })).toBeUndefined()
    }
  })
})
