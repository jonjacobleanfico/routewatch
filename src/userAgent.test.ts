import { recordUserAgent, getUserAgentStats, getAllUserAgentStats, getTopUserAgents, clearUserAgentLog } from './userAgent';
import { Request } from 'express';

function makeReq(ua: string): Partial<Request> {
  return {
    headers: { 'user-agent': ua },
  } as Partial<Request>;
}

beforeEach(() => {
  clearUserAgentLog();
});

describe('recordUserAgent', () => {
  it('records a new user agent entry', () => {
    recordUserAgent('GET', '/api/users', makeReq('Mozilla/5.0') as Request);
    const stats = getUserAgentStats('GET', '/api/users');
    expect(stats).toHaveLength(1);
    expect(stats[0].userAgent).toBe('Mozilla/5.0');
    expect(stats[0].count).toBe(1);
  });

  it('increments count for repeated user agent on same route', () => {
    recordUserAgent('GET', '/api/users', makeReq('curl/7.68') as Request);
    recordUserAgent('GET', '/api/users', makeReq('curl/7.68') as Request);
    const stats = getUserAgentStats('GET', '/api/users');
    expect(stats[0].count).toBe(2);
  });

  it('tracks multiple user agents on the same route', () => {
    recordUserAgent('GET', '/api/items', makeReq('Chrome/100') as Request);
    recordUserAgent('GET', '/api/items', makeReq('Firefox/99') as Request);
    recordUserAgent('GET', '/api/items', makeReq('Chrome/100') as Request);
    const stats = getUserAgentStats('GET', '/api/items');
    expect(stats).toHaveLength(2);
    expect(stats[0].userAgent).toBe('Chrome/100');
    expect(stats[0].count).toBe(2);
  });

  it('uses "unknown" when no user-agent header is present', () => {
    const req = { headers: {} } as Request;
    recordUserAgent('POST', '/api/data', req);
    const stats = getUserAgentStats('POST', '/api/data');
    expect(stats[0].userAgent).toBe('unknown');
  });
});

describe('getAllUserAgentStats', () => {
  it('returns stats grouped by route', () => {
    recordUserAgent('GET', '/api/users', makeReq('AgentA') as Request);
    recordUserAgent('POST', '/api/users', makeReq('AgentB') as Request);
    const all = getAllUserAgentStats();
    expect(all['GET /api/users']).toBeDefined();
    expect(all['POST /api/users']).toBeDefined();
  });

  it('returns empty object when no hits recorded', () => {
    expect(getAllUserAgentStats()).toEqual({});
  });
});

describe('getTopUserAgents', () => {
  it('returns top user agents across all routes', () => {
    recordUserAgent('GET', '/a', makeReq('BotX') as Request);
    recordUserAgent('GET', '/b', makeReq('BotX') as Request);
    recordUserAgent('GET', '/c', makeReq('BotX') as Request);
    recordUserAgent('GET', '/a', makeReq('BrowserY') as Request);
    const top = getTopUserAgents(2);
    expect(top[0].userAgent).toBe('BotX');
    expect(top[0].count).toBe(3);
    expect(top).toHaveLength(2);
  });

  it('respects the limit parameter', () => {
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(ua =>
      recordUserAgent('GET', '/test', makeReq(ua) as Request)
    );
    expect(getTopUserAgents(3)).toHaveLength(3);
  });
});
