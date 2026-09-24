import { describe, expect, it } from 'vitest';
import { REQUIRED_ROUTE_PATHS } from './routes';

describe('route manifest', () => {
  it('contains every public route exactly once', () => {
    expect(REQUIRED_ROUTE_PATHS).toEqual([
      '/', '/live', '/forecast', '/campus', '/status', '/about', '/privacy', '/imprint',
    ]);
    expect(new Set(REQUIRED_ROUTE_PATHS).size).toBe(REQUIRED_ROUTE_PATHS.length);
  });
});
