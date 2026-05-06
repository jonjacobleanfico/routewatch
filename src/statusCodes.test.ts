import express from 'express';
import request from 'supertest';
import {
  recordStatusCode,
  getStatusCodeStats,
  getStatusCodeSummary,
  getAllStatusCodeStats,
  clearStatusCodeLogs,
} from './statusCodes';
import { statusCodesRouter } from './statusCodesRouter';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/routewatch/status-codes', statusCodesRouter);
  return app;
}

beforeEach(() => {
  clearStatusCodeLogs();
});

describe('recordStatusCode / getStatusCodeStats', () => {
  it('records a single status code', () => {
    recordStatusCode('GET', '/api/users', 200);
    const stats = getStatusCodeStats('GET', '/api/users');
    expect(stats[200]).toBe(1);
  });

  it('accumulates multiple hits for the same status code', () => {
    recordStatusCode('GET', '/api/users', 200);
    recordStatusCode('GET', '/api/users', 200);
    recordStatusCode('GET', '/api/users', 404);
    const stats = getStatusCodeStats('GET', '/api/users');
    expect(stats[200]).toBe(2);
    expect(stats[404]).toBe(1);
  });

  it('returns empty object for unknown route', () => {
    expect(getStatusCodeStats('POST', '/unknown')).toEqual({});
  });
});

describe('getStatusCodeSummary', () => {
  it('computes success and error rates correctly', () => {
    recordStatusCode('POST', '/api/items', 201);
    recordStatusCode('POST', '/api/items', 201);
    recordStatusCode('POST', '/api/items', 400);
    recordStatusCode('POST', '/api/items', 500);
    const summary = getStatusCodeSummary('POST', '/api/items');
    expect(summary.total).toBe(4);
    expect(summary.successRate).toBeCloseTo(0.5);
    expect(summary.errorRate).toBeCloseTo(0.5);
  });

  it('returns zero rates for unknown route', () => {
    const summary = getStatusCodeSummary('DELETE', '/nope');
    expect(summary.total).toBe(0);
    expect(summary.successRate).toBe(0);
    expect(summary.errorRate).toBe(0);
  });
});

describe('statusCodesRouter', () => {
  it('GET / returns all stats', async () => {
    recordStatusCode('GET', '/api/test', 200);
    const res = await request(buildApp()).get('/routewatch/status-codes');
    expect(res.status).toBe(200);
    expect(res.body['GET /api/test']).toBeDefined();
  });

  it('GET /:method/:routePath returns summary for known route', async () => {
    recordStatusCode('GET', '/api/hello', 200);
    const res = await request(buildApp()).get(
      '/routewatch/status-codes/GET/' + encodeURIComponent('/api/hello')
    );
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it('GET /:method/:routePath returns 404 for unknown route', async () => {
    const res = await request(buildApp()).get(
      '/routewatch/status-codes/GET/' + encodeURIComponent('/no/such/route')
    );
    expect(res.status).toBe(404);
  });

  it('DELETE / clears logs', async () => {
    recordStatusCode('GET', '/api/clear', 200);
    await request(buildApp()).delete('/routewatch/status-codes');
    expect(getAllStatusCodeStats()).toEqual({});
  });
});
