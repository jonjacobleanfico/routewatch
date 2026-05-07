import { computeRouteHealth, summarizeHealth, RouteHealthScore } from './routeHealth';

function makeOpts(overrides: Partial<Parameters<typeof computeRouteHealth>[2]> = {}) {
  return {
    totalHits: 100,
    errorCount: 0,
    avgResponseTimeMs: 200,
    p95ResponseTimeMs: 400,
    ...overrides,
  };
}

describe('computeRouteHealth', () => {
  it('returns score of 100 for a healthy route', () => {
    const result = computeRouteHealth('/api/users', 'GET', makeOpts());
    expect(result.score).toBe(100);
    expect(result.reasons).toContain('healthy');
  });

  it('returns -1 for insufficient data', () => {
    const result = computeRouteHealth('/api/users', 'GET', makeOpts({ totalHits: 3 }));
    expect(result.score).toBe(-1);
    expect(result.reasons).toContain('insufficient data');
  });

  it('penalizes high error rate', () => {
    const result = computeRouteHealth('/api/users', 'GET', makeOpts({ errorCount: 30 }));
    expect(result.score).toBeLessThan(100);
    expect(result.reasons.some((r) => r.includes('error rate'))).toBe(true);
  });

  it('penalizes slow average response time', () => {
    const result = computeRouteHealth('/api/users', 'GET', makeOpts({ avgResponseTimeMs: 2500 }));
    expect(result.score).toBeLessThan(100);
    expect(result.reasons.some((r) => r.includes('avg response'))).toBe(true);
  });

  it('penalizes slow p95 response time', () => {
    const result = computeRouteHealth('/api/users', 'GET', makeOpts({ p95ResponseTimeMs: 3000 }));
    expect(result.score).toBeLessThan(100);
    expect(result.reasons.some((r) => r.includes('p95 response'))).toBe(true);
  });

  it('score never goes below 0', () => {
    const result = computeRouteHealth('/api/bad', 'POST', makeOpts({
      errorCount: 100,
      avgResponseTimeMs: 10000,
      p95ResponseTimeMs: 20000,
    }));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('includes route and method in result', () => {
    const result = computeRouteHealth('/api/items', 'DELETE', makeOpts());
    expect(result.route).toBe('/api/items');
    expect(result.method).toBe('DELETE');
  });
});

describe('summarizeHealth', () => {
  it('calculates average score from valid entries', () => {
    const scores: RouteHealthScore[] = [
      { route: '/a', method: 'GET', score: 80, reasons: [] },
      { route: '/b', method: 'POST', score: 60, reasons: [] },
    ];
    const summary = summarizeHealth(scores);
    expect(summary.overall).toBe(70);
  });

  it('excludes -1 scores from average', () => {
    const scores: RouteHealthScore[] = [
      { route: '/a', method: 'GET', score: 80, reasons: [] },
      { route: '/b', method: 'GET', score: -1, reasons: ['insufficient data'] },
    ];
    const summary = summarizeHealth(scores);
    expect(summary.overall).toBe(80);
  });

  it('returns 100 when no valid scores exist', () => {
    const summary = summarizeHealth([]);
    expect(summary.overall).toBe(100);
  });
});
