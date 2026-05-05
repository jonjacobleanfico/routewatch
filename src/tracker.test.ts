import { recordHit, getStats, resetStats, RouteHit } from './tracker';

function makeHit(overrides: Partial<RouteHit> = {}): RouteHit {
  return {
    method: 'GET',
    path: '/api/users',
    statusCode: 200,
    responseTimeMs: 50,
    timestamp: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  resetStats();
});

describe('tracker', () => {
  it('returns empty stats when no hits recorded', () => {
    expect(getStats()).toEqual([]);
  });

  it('records a single hit and returns correct stats', () => {
    recordHit(makeHit());
    const stats = getStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].hitCount).toBe(1);
    expect(stats[0].avgResponseTimeMs).toBe(50);
    expect(stats[0].statusCodes[200]).toBe(1);
  });

  it('aggregates multiple hits for the same route', () => {
    recordHit(makeHit({ responseTimeMs: 100 }));
    recordHit(makeHit({ responseTimeMs: 200 }));
    const stats = getStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].hitCount).toBe(2);
    expect(stats[0].avgResponseTimeMs).toBe(150);
  });

  it('tracks different routes separately', () => {
    recordHit(makeHit({ path: '/api/users' }));
    recordHit(makeHit({ method: 'POST', path: '/api/posts' }));
    const stats = getStats();
    expect(stats).toHaveLength(2);
  });

  it('counts status codes per route', () => {
    recordHit(makeHit({ statusCode: 200 }));
    recordHit(makeHit({ statusCode: 404 }));
    recordHit(makeHit({ statusCode: 200 }));
    const stats = getStats();
    expect(stats[0].statusCodes[200]).toBe(2);
    expect(stats[0].statusCodes[404]).toBe(1);
  });

  it('resets stats correctly', () => {
    recordHit(makeHit());
    resetStats();
    expect(getStats()).toEqual([]);
  });
});
