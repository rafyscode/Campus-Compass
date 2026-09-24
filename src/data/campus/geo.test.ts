import { describe, expect, it } from 'vitest';
import { geoToWorld, planPixelToWorld } from './geo';

function distance(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

describe('campus geospatial transform', () => {
  it('maps the configured origin close to world zero', () => {
    const origin = geoToWorld({ latitude: 53.22855, longitude: 10.40143 });
    expect(origin.x).toBeCloseTo(0, 6);
    expect(origin.z).toBeCloseTo(0, 6);
  });

  it('calibrates the plan Mensa centroid to its geo anchor', () => {
    const plan = planPixelToWorld({ x: 514.5, y: 456.3333333333 });
    const geo = geoToWorld({ latitude: 53.22927, longitude: 10.39824 });
    expect(distance(plan, geo)).toBeLessThan(0.5);
  });

  it('calibrates the plan library centroid to its geo anchor', () => {
    const plan = planPixelToWorld({ x: 965.75, y: 905.125 });
    const geo = geoToWorld({ latitude: 53.22782, longitude: 10.40121 });
    expect(distance(plan, geo)).toBeLessThan(0.5);
  });

  it('calibrates the plan Central Building centroid to its geo anchor', () => {
    const plan = planPixelToWorld({ x: 1632.8, y: 750.8 });
    const geo = geoToWorld({ latitude: 53.22832, longitude: 10.40448 });
    expect(distance(plan, geo)).toBeLessThan(0.5);
  });
});
