import { evaluateAlerts, getTriggeredAlerts, AlertRule } from './alerts';
import { RouteStats } from './tracker';

function makeStats(overrides: Partial<RouteStats> = {}): RouteStats {
  return {
    hits: 10,
    errorCount: 0,
    avgDuration: 200,
    lastHit: new Date().toISOString(),
    statusCodes: { 200: 10 },
    ...overrides,
  };
}

function makeStatsMap(
  entries: Array<[string, Partial<RouteStats>]>
): Record<string, RouteStats> {
  return Object.fromEntries(entries.map(([k, v]) => [k, makeStats(v)]));
}

describe('evaluateAlerts', () => {
  it('returns empty array when no rules are triggered', () => {
    const statsMap = makeStatsMap([['GET /api/users', {}]]);
    const results = evaluateAlerts(statsMap);
    expect(results).toHaveLength(0);
  });

  it('triggers high-error-rate alert', () => {
    const statsMap = makeStatsMap([
      ['GET /api/users', { hits: 10, errorCount: 3 }],
    ]);
    const results = evaluateAlerts(statsMap);
    expect(results.some((r) => r.ruleId === 'high-error-rate')).toBe(true);
  });

  it('triggers slow-response alert', () => {
    const statsMap = makeStatsMap([
      ['POST /api/data', { avgDuration: 1500 }],
    ]);
    const results = evaluateAlerts(statsMap);
    expect(results.some((r) => r.ruleId === 'slow-response')).toBe(true);
  });

  it('triggers high-traffic alert', () => {
    const statsMap = makeStatsMap([['GET /api/feed', { hits: 600 }]]);
    const results = evaluateAlerts(statsMap);
    expect(results.some((r) => r.ruleId === 'high-traffic')).toBe(true);
  });

  it('supports custom rules', () => {
    const customRule: AlertRule = {
      id: 'zero-hits',
      description: 'Route has never been hit',
      check: (stats) => stats.hits === 0,
    };
    const statsMap = makeStatsMap([['DELETE /api/old', { hits: 0 }]]);
    const results = evaluateAlerts(statsMap, [customRule]);
    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe('zero-hits');
  });

  it('attaches correct route and method to result', () => {
    const statsMap = makeStatsMap([
      ['GET /api/users', { hits: 10, errorCount: 3 }],
    ]);
    const results = evaluateAlerts(statsMap);
    expect(results[0].route).toBe('/api/users');
    expect(results[0].method).toBe('GET');
  });
});

describe('getTriggeredAlerts', () => {
  it('returns only triggered alerts', () => {
    const statsMap = makeStatsMap([
      ['GET /fast', { avgDuration: 100 }],
      ['GET /slow', { avgDuration: 2000 }],
    ]);
    const triggered = getTriggeredAlerts(statsMap);
    expect(triggered.every((r) => r.triggered)).toBe(true);
  });
});
