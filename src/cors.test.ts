import request from 'supertest';
import express from 'express';
import {
  checkCors,
  clearCorsViolations,
  getCorsViolations,
  getCorsViolationsByRoute,
  setAllowedOrigins,
  getAllowedOrigins,
} from './cors';
import { corsRouter } from './corsRouter';
import { RouteHit } from './tracker';

function makeHit(route = '/api/test', method = 'GET'): RouteHit {
  return { route, method, timestamp: Date.now(), duration: 10, status: 200 };
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/__routewatch/cors', corsRouter);
  return app;
}

beforeEach(() => {
  clearCorsViolations();
  setAllowedOrigins([]);
});

describe('checkCors', () => {
  it('allows all origins when no rules set', () => {
    expect(checkCors(makeHit(), 'https://evil.com')).toBe(true);
  });

  it('allows matching origin', () => {
    setAllowedOrigins(['https://example.com']);
    expect(checkCors(makeHit(), 'https://example.com')).toBe(true);
    expect(getCorsViolations()).toHaveLength(0);
  });

  it('blocks and records non-matching origin', () => {
    setAllowedOrigins(['https://example.com']);
    expect(checkCors(makeHit(), 'https://evil.com')).toBe(false);
    expect(getCorsViolations()).toHaveLength(1);
    expect(getCorsViolations()[0].origin).toBe('https://evil.com');
  });

  it('allows wildcard origin', () => {
    setAllowedOrigins(['*']);
    expect(checkCors(makeHit(), 'https://anything.com')).toBe(true);
  });

  it('groups violations by route', () => {
    setAllowedOrigins(['https://example.com']);
    checkCors(makeHit('/api/a'), 'https://evil.com');
    checkCors(makeHit('/api/a'), 'https://other.com');
    checkCors(makeHit('/api/b'), 'https://evil.com');
    const byRoute = getCorsViolationsByRoute();
    expect(byRoute['/api/a']).toHaveLength(2);
    expect(byRoute['/api/b']).toHaveLength(1);
  });
});

describe('corsRouter', () => {
  it('GET /violations returns empty array initially', async () => {
    const res = await request(buildApp()).get('/__routewatch/cors/violations');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /allowed-origins sets origins', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/cors/allowed-origins')
      .send({ origins: ['https://example.com'] });
    expect(res.status).toBe(200);
    expect(getAllowedOrigins()).toContain('https://example.com');
  });

  it('DELETE /violations clears violations', async () => {
    setAllowedOrigins(['https://example.com']);
    checkCors(makeHit(), 'https://evil.com');
    const res = await request(buildApp()).delete('/__routewatch/cors/violations');
    expect(res.status).toBe(200);
    expect(getCorsViolations()).toHaveLength(0);
  });
});
