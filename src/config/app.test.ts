import { describe, expect, it } from 'vitest';
import { getOccupancyLevel } from './app';

describe('occupancy level configuration', () => {
  it('maps boundary values consistently', () => {
    expect(getOccupancyLevel(0).key).toBe('very-quiet');
    expect(getOccupancyLevel(25).key).toBe('quiet');
    expect(getOccupancyLevel(50).key).toBe('moderate');
    expect(getOccupancyLevel(70).key).toBe('full');
    expect(getOccupancyLevel(85).key).toBe('very-full');
  });
});
