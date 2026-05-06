import {
  recordRequestSize,
  getRequestSizeStats,
  getAllRequestSizeStats,
  extractRequestBytes,
  clearRequestSizeLogs,
} from './requestSize';
import { Request } from 'express';

beforeEach(() => {
  clearRequestSizeLogs();
});

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    body: null,
    ...overrides,
  } as unknown as Request;
}

describe('recordRequestSize', () => {
  it('records a new entry', () => {
    recordRequestSize('POST', '/api/users', 256);
    const stats = getRequestSizeStats('POST', '/api/users');
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(1);
    expect(stats!.totalBytes).toBe(256);
    expect(stats!.avgBytes).toBe(256);
    expect(stats!.maxBytes).toBe(256);
    expect(stats!.minBytes).toBe(256);
  });

  it('accumulates multiple hits', () => {
    recordRequestSize('POST', '/api/users', 100);
    recordRequestSize('POST', '/api/users', 300);
    recordRequestSize('POST', '/api/users', 200);
    const stats = getRequestSizeStats('POST', '/api/users');
    expect(stats!.count).toBe(3);
    expect(stats!.totalBytes).toBe(600);
    expect(stats!.avgBytes).toBe(200);
    expect(stats!.maxBytes).toBe(300);
    expect(stats!.minBytes).toBe(100);
  });

  it('tracks different routes independently', () => {
    recordRequestSize('POST', '/api/users', 100);
    recordRequestSize('PUT', '/api/items', 500);
    expect(getRequestSizeStats('POST', '/api/users')!.totalBytes).toBe(100);
    expect(getRequestSizeStats('PUT', '/api/items')!.totalBytes).toBe(500);
  });
});

describe('getRequestSizeStats', () => {
  it('returns null for unknown route', () => {
    expect(getRequestSizeStats('GET', '/unknown')).toBeNull();
  });
});

describe('getAllRequestSizeStats', () => {
  it('returns all entries', () => {
    recordRequestSize('GET', '/a', 50);
    recordRequestSize('POST', '/b', 150);
    const all = getAllRequestSizeStats();
    expect(all).toHaveLength(2);
    const routes = all.map((e) => e.route);
    expect(routes).toContain('/a');
    expect(routes).toContain('/b');
  });

  it('returns empty array when no data', () => {
    expect(getAllRequestSizeStats()).toEqual([]);
  });
});

describe('extractRequestBytes', () => {
  it('uses content-length header when present', () => {
    const req = makeReq({ headers: { 'content-length': '512' } });
    expect(extractRequestBytes(req)).toBe(512);
  });

  it('falls back to body size when no header', () => {
    const req = makeReq({ headers: {}, body: { name: 'Alice' } });
    const bytes = extractRequestBytes(req);
    expect(bytes).toBeGreaterThan(0);
  });

  it('returns 0 when no header and no body', () => {
    const req = makeReq({ headers: {}, body: null });
    expect(extractRequestBytes(req)).toBe(0);
  });
});
