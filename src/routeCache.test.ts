import {
  setCacheRule,
  removeCacheRule,
  getCacheRule,
  recordCacheHit,
  recordCacheEviction,
  getCacheStats,
  getAllCacheStats,
  clearCacheStats,
} from './routeCache';

beforeEach(() => clearCacheStats());

describe('setCacheRule / getCacheRule', () => {
  it('stores and retrieves a rule', () => {
    setCacheRule('GET', '/api/users', { ttl: 60 });
    expect(getCacheRule('GET', '/api/users')).toEqual({ ttl: 60 });
  });

  it('is case-insensitive for method', () => {
    setCacheRule('get', '/api/items', { ttl: 30, maxSize: 100 });
    expect(getCacheRule('GET', '/api/items')).toEqual({ ttl: 30, maxSize: 100 });
  });

  it('returns undefined for unknown route', () => {
    expect(getCacheRule('GET', '/unknown')).toBeUndefined();
  });
});

describe('removeCacheRule', () => {
  it('removes an existing rule and returns true', () => {
    setCacheRule('GET', '/api/data', { ttl: 120 });
    expect(removeCacheRule('GET', '/api/data')).toBe(true);
    expect(getCacheRule('GET', '/api/data')).toBeUndefined();
  });

  it('returns false when rule does not exist', () => {
    expect(removeCacheRule('DELETE', '/nope')).toBe(false);
  });
});

describe('recordCacheHit / getCacheStats', () => {
  it('tracks hits and misses', () => {
    setCacheRule('GET', '/api/posts', { ttl: 45 });
    recordCacheHit('GET', '/api/posts', true);
    recordCacheHit('GET', '/api/posts', true);
    recordCacheHit('GET', '/api/posts', false);
    const stats = getCacheStats('GET', '/api/posts');
    expect(stats?.hits).toBe(2);
    expect(stats?.misses).toBe(1);
    expect(stats?.evictions).toBe(0);
  });

  it('tracks evictions', () => {
    setCacheRule('POST', '/api/items', { ttl: 10 });
    recordCacheEviction('POST', '/api/items');
    recordCacheEviction('POST', '/api/items');
    const stats = getCacheStats('POST', '/api/items');
    expect(stats?.evictions).toBe(2);
  });

  it('returns undefined when no rule exists', () => {
    expect(getCacheStats('GET', '/no-rule')).toBeUndefined();
  });
});

describe('getAllCacheStats', () => {
  it('returns all entries', () => {
    setCacheRule('GET', '/a', { ttl: 10 });
    setCacheRule('GET', '/b', { ttl: 20 });
    const all = getAllCacheStats();
    expect(all).toHaveLength(2);
    expect(all.map(e => e.route).sort()).toEqual(['/a', '/b']);
  });

  it('returns empty array when nothing is set', () => {
    expect(getAllCacheStats()).toEqual([]);
  });
});

describe('clearCacheStats', () => {
  it('clears all rules and stats', () => {
    setCacheRule('GET', '/clear-me', { ttl: 5 });
    clearCacheStats();
    expect(getAllCacheStats()).toEqual([]);
    expect(getCacheRule('GET', '/clear-me')).toBeUndefined();
  });
});
