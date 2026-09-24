import { describe, expect, it } from 'vitest';
import { BUILDING_BY_ID, CAMPUS_BUILDINGS } from './buildings';

 describe('campus building model', () => {
  it('contains unique building ids', () => {
    const ids = CAMPUS_BUILDINGS.map((building) => building.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('contains the required showcase buildings', () => {
    expect(BUILDING_BY_ID.get('mensa')?.sensorReady).toBe(true);
    expect(BUILDING_BY_ID.get('library')?.important).toBe(true);
    expect(BUILDING_BY_ID.get('central')?.heightM).toBe(36.75);
  });

  it('uses polygon footprints with at least four points', () => {
    for (const building of CAMPUS_BUILDINGS) expect(building.footprint.length).toBeGreaterThanOrEqual(4);
  });
});
