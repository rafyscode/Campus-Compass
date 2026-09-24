import { describe, expect, it } from 'vitest';
import { getBestWindow } from './BestTimeCard';
import type { ForecastPoint } from '../../types/domain';

const points: ForecastPoint[] = [
  { generatedAt: '2026-09-13T12:00:00Z', targetAt: '2026-09-13T12:15:00Z', horizonMinutes: 15, predictedPercent: 52, lowerBound: 48, upperBound: 56, confidence: .9 },
  { generatedAt: '2026-09-13T12:00:00Z', targetAt: '2026-09-13T12:45:00Z', horizonMinutes: 45, predictedPercent: 31, lowerBound: 25, upperBound: 37, confidence: .85 },
  { generatedAt: '2026-09-13T12:00:00Z', targetAt: '2026-09-13T13:30:00Z', horizonMinutes: 90, predictedPercent: 44, lowerBound: 36, upperBound: 52, confidence: .8 },
];

describe('best time recommendation', () => {
  it('selects the lowest forecast inside two hours', () => {
    expect(getBestWindow(points)?.percent).toBe(31);
  });
});
