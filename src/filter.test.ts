import { filterStats, sortStats, FilterOptions } from './filter';
import { RouteStats } from './tracker';

function makeStats(overrides: Partial<RouteStats> = {}): RouteStats {
  return {
    method: 'GET',
    path: '/api/users',
    hits: 10,
    avgDuration: 45,
    lastHit: new Date().toISOString(),
    statusCodes: { 200: 9, 404: 1 },
    ...overrides,
  };
}

describe('filterStats', () => {
  const stats: RouteStats[] = [
    makeStats({ method: 'GET', path: '/api/users', hits: 10, statusCodes: { 200: 10 } }),
    makeStats({ method: 'POST', path: '/api/users', hits: 3, statusCodes: { 201: 3 } }),
    makeStats({ method: 'GET', path: '/api/products', hits: 7, statusCodes: { 200: 6, 500: 1 } }),
    makeStats({ method: 'DELETE', path: '/api/users/1', hits: 1, statusCodes: { 204: 1 } }),
  ];

  it('filters by single method', () => {
    const result = filterStats(stats, { method: 'POST' });
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('POST');
  });

  it('filters by multiple methods', () => {
    const result = filterStats(stats, { method: ['GET', 'DELETE'] });
    expect(result).toHaveLength(3);
  });

  it('filters by path pattern string', () => {
    const result = filterStats(stats, { pathPattern: '/api/users' });
    expect(result).toHaveLength(3);
  });

  it('filters by path pattern regex', () => {
    const result = filterStats(stats, { pathPattern: /^\/api\/products/ });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/api/products');
  });

  it('filters by status code', () => {
    const result = filterStats(stats, { statusCode: 500 });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/api/products');
  });

  it('filters by multiple status codes', () => {
    const result = filterStats(stats, { statusCode: [201, 204] });
    expect(result).toHaveLength(2);
  });

  it('filters by minHits', () => {
    const result = filterStats(stats, { minHits: 5 });
    expect(result).toHaveLength(2);
  });

  it('combines multiple filters', () => {
    const result = filterStats(stats, { method: 'GET', minHits: 8 });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/api/users');
  });
});

describe('sortStats', () => {
  const stats: RouteStats[] = [
    makeStats({ path: '/b', hits: 5, avgDuration: 30 }),
    makeStats({ path: '/a', hits: 20, avgDuration: 10 }),
    makeStats({ path: '/c', hits: 1, avgDuration: 80 }),
  ];

  it('sorts by hits descending by default', () => {
    const result = sortStats(stats);
    expect(result[0].hits).toBe(20);
    expect(result[2].hits).toBe(1);
  });

  it('sorts by hits ascending', () => {
    const result = sortStats(stats, 'hits', 'asc');
    expect(result[0].hits).toBe(1);
  });

  it('sorts by avgDuration descending', () => {
    const result = sortStats(stats, 'avgDuration', 'desc');
    expect(result[0].avgDuration).toBe(80);
  });

  it('sorts by path ascending', () => {
    const result = sortStats(stats, 'path', 'asc');
    expect(result[0].path).toBe('/a');
    expect(result[2].path).toBe('/c');
  });

  it('does not mutate original array', () => {
    const original = [...stats];
    sortStats(stats, 'hits', 'asc');
    expect(stats[0].hits).toBe(original[0].hits);
  });
});
