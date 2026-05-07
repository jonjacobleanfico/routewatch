import {
  recordRequestCountHit,
  getRequestCountInWindow,
  getAllRequestCounts,
  getTopRequestedRoutes,
  clearRequestCountLog,
  routeKey,
} from './requestCount';

beforeEach(() => {
  clearRequestCountLog();
});

describe('routeKey', () => {
  it('formats method and path into a key', () => {
    expect(routeKey('get', '/users')).toBe('GET /users');
    expect(routeKey('POST', '/items')).toBe('POST /items');
  });
});

describe('recordRequestCountHit + getRequestCountInWindow', () => {
  it('counts hits within the window', () => {
    recordRequestCountHit('GET', '/users');
    recordRequestCountHit('GET', '/users');
    recordRequestCountHit('POST', '/users');
    expect(getRequestCountInWindow('GET', '/users', '5m')).toBe(2);
    expect(getRequestCountInWindow('POST', '/users', '5m')).toBe(1);
  });

  it('returns 0 for unrecorded routes', () => {
    expect(getRequestCountInWindow('DELETE', '/nothing', '1m')).toBe(0);
  });
});

describe('getAllRequestCounts', () => {
  it('returns counts for all recorded routes', () => {
    recordRequestCountHit('GET', '/a');
    recordRequestCountHit('GET', '/a');
    recordRequestCountHit('GET', '/b');
    const counts = getAllRequestCounts('5m');
    expect(counts['GET /a']).toBe(2);
    expect(counts['GET /b']).toBe(1);
  });

  it('returns empty object when no hits', () => {
    expect(getAllRequestCounts('1m')).toEqual({});
  });
});

describe('getTopRequestedRoutes', () => {
  it('returns routes sorted by count descending', () => {
    recordRequestCountHit('GET', '/a');
    recordRequestCountHit('GET', '/a');
    recordRequestCountHit('GET', '/a');
    recordRequestCountHit('GET', '/b');
    recordRequestCountHit('GET', '/b');
    recordRequestCountHit('POST', '/c');
    const top = getTopRequestedRoutes('5m', 3);
    expect(top[0].route).toBe('GET /a');
    expect(top[0].count).toBe(3);
    expect(top[1].route).toBe('GET /b');
    expect(top[2].count).toBe(1);
  });

  it('respects the limit parameter', () => {
    for (let i = 0; i < 5; i++) recordRequestCountHit('GET', `/route${i}`);
    const top = getTopRequestedRoutes('5m', 2);
    expect(top).toHaveLength(2);
  });
});

describe('clearRequestCountLog', () => {
  it('resets all recorded data', () => {
    recordRequestCountHit('GET', '/x');
    clearRequestCountLog();
    expect(getAllRequestCounts('5m')).toEqual({});
  });
});
