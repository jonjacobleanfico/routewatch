import {
  recordQueryParams,
  getQueryParamStats,
  getAllQueryParamStats,
  getQueryParamLog,
  clearQueryParamLog,
} from './queryParams';

beforeEach(() => {
  clearQueryParamLog();
});

describe('recordQueryParams', () => {
  it('records a query param entry', () => {
    recordQueryParams('GET', '/search', { q: 'hello', page: '1' });
    const log = getQueryParamLog();
    expect(log).toHaveLength(1);
    expect(log[0].route).toBe('/search');
    expect(log[0].method).toBe('GET');
    expect(log[0].params).toEqual({ q: 'hello', page: '1' });
  });

  it('records multiple entries', () => {
    recordQueryParams('GET', '/search', { q: 'foo' });
    recordQueryParams('GET', '/search', { q: 'bar' });
    expect(getQueryParamLog()).toHaveLength(2);
  });
});

describe('getQueryParamStats', () => {
  it('returns null for unknown route', () => {
    expect(getQueryParamStats('GET', '/unknown')).toBeNull();
  });

  it('aggregates param key counts', () => {
    recordQueryParams('GET', '/items', { sort: 'asc', page: '1' });
    recordQueryParams('GET', '/items', { sort: 'desc' });
    const stats = getQueryParamStats('GET', '/items');
    expect(stats).not.toBeNull();
    expect(stats!.totalHits).toBe(2);
    expect(stats!.paramKeys['sort']).toBe(2);
    expect(stats!.paramKeys['page']).toBe(1);
  });

  it('aggregates param value counts', () => {
    recordQueryParams('GET', '/items', { sort: 'asc' });
    recordQueryParams('GET', '/items', { sort: 'asc' });
    recordQueryParams('GET', '/items', { sort: 'desc' });
    const stats = getQueryParamStats('GET', '/items');
    expect(stats!.paramValues['sort']['asc']).toBe(2);
    expect(stats!.paramValues['sort']['desc']).toBe(1);
  });

  it('is case-insensitive for method', () => {
    recordQueryParams('get', '/test', { x: '1' });
    const stats = getQueryParamStats('GET', '/test');
    expect(stats).not.toBeNull();
    expect(stats!.method).toBe('GET');
  });
});

describe('getAllQueryParamStats', () => {
  it('returns stats for all routes', () => {
    recordQueryParams('GET', '/a', { foo: 'bar' });
    recordQueryParams('POST', '/b', { baz: 'qux' });
    const all = getAllQueryParamStats();
    expect(all).toHaveLength(2);
    const routes = all.map(s => s.route);
    expect(routes).toContain('/a');
    expect(routes).toContain('/b');
  });
});

describe('clearQueryParamLog', () => {
  it('clears the log', () => {
    recordQueryParams('GET', '/x', { a: 'b' });
    clearQueryParamLog();
    expect(getQueryParamLog()).toHaveLength(0);
  });
});
