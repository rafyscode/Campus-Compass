import { describe, expect, it } from 'vitest';
import { createForecast, createHistory, occupancyAt } from './mockData';

describe('deterministic mock data', () => {
  const instant = new Date('2026-09-13T12:00:00.000Z');

  it('returns the same occupancy for the same instant', () => {
    expect(occupancyAt(instant)).toBe(occupancyAt(new Date(instant)));
  });

  it('keeps generated values inside valid occupancy bounds', () => {
    const history = createHistory(instant, 120);
    const forecast = createForecast(instant);
    for (const point of history) expect(point.percent).toBeGreaterThanOrEqual(0);
    for (const point of forecast) {
      expect(point.predictedPercent).toBeGreaterThanOrEqual(0);
      expect(point.predictedPercent).toBeLessThanOrEqual(100);
      expect(point.lowerBound).toBeLessThanOrEqual(point.predictedPercent);
      expect(point.upperBound).toBeGreaterThanOrEqual(point.predictedPercent);
    }
  });
});
