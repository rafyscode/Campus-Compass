import { describe, expect, it } from 'vitest'
import { campusBuildings, buildingById } from './buildings'
import { campusPois, searchablePois } from './pois'
import { campusWalkways } from './landscape'
import { findBuildingPoi } from '../../utils/buildingSelection'

describe('campus footprint identities', () => {
  it('covers the numbered campus plan and five distinct lecture halls', () => {
    const numbers = campusBuildings.features.map((f) => f.properties.buildingNumber).filter(Boolean)
    expect(numbers.sort()).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '25', '26', '27', '28', '35', '40', '41'].sort())
    for (const number of [1, 2, 3, 4, 5]) expect(buildingById.has(`lecture-hall-${number}`)).toBe(true)
    expect(buildingById.has('library')).toBe(true)
    expect(buildingById.get('building-41')?.properties.osmId).not.toBe(buildingById.get('lecture-hall-5')?.properties.osmId)
  })

  it('places every building label inside exactly its own footprint', () => {
    for (const feature of campusBuildings.features) {
      expect(findBuildingPoi(feature, campusPois)?.id, feature.properties.name).toBe(feature.properties.id)
      expect(feature.id).toBe(feature.properties.id)
      const rings = feature.geometry.type === 'Polygon' ? feature.geometry.coordinates : feature.geometry.coordinates.flat()
      for (const ring of rings) {
        expect(ring.length).toBeGreaterThanOrEqual(4)
        expect(ring.at(-1)).toEqual(ring[0])
        expect(ring.flat().every(Number.isFinite)).toBe(true)
      }
    }
  })

  it('keeps derived C28 geometry and approximate heights explicit', () => {
    expect(buildingById.get('building-28')?.properties.geometryConfidence).toBe('plan-derived')
    expect(buildingById.get('building-28')?.properties.confidence).toBe('derived')
    expect(buildingById.get('mensa')?.properties.osmIds).toContain('way/25428437')
    for (const feature of campusBuildings.features.filter((f) => f.id !== 'central-building')) expect(feature.properties.heightApproximate).toBe(true)
  })

  it('supports official campus building shorthand and spaced form', () => {
    const c7 = searchablePois.find((poi) => poi.id === 'building-7')
    expect(c7?.searchText).toContain('c7')
    expect(c7?.searchText).toContain('c 7')
  })
})

describe('real walking network', () => {
  it('preserves shared OSM node coordinates and excludes prohibited ways', () => {
    const nodeLocations = new Map<string, number[]>()
    expect(campusWalkways.features.length).toBeGreaterThan(100)
    for (const feature of campusWalkways.features) {
      expect(feature.properties.nodeIds.length).toBe(feature.geometry.coordinates.length)
      expect(['no', 'private']).not.toContain(feature.properties.foot)
      if (['no', 'private'].includes(feature.properties.access ?? '')) expect(['yes', 'designated', 'permissive']).toContain(feature.properties.foot)
      feature.properties.nodeIds.forEach((id, index) => {
        const coordinates = feature.geometry.coordinates[index]
        if (nodeLocations.has(id)) expect(coordinates).toEqual(nodeLocations.get(id))
        else nodeLocations.set(id, coordinates)
      })
    }
  })
})
