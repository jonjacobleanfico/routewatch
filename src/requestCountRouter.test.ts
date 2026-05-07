import express from 'express';
import request from 'supertest';
import { requestCountRouter } from './requestCountRouter';
import { recordRequestCountHit, clearRequestCountLog } from './requestCount';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/__routewatch', requestCountRouter);
  return app;
}

beforeEach(() => {
  clearRequestCountLog();
});

describe('GET /__routewatch/request-counts', () => {
  it('returns counts for default 5m window', async () => {
    recordRequestCountHit('GET', '/users');
    recordRequestCountHit('GET', '/users');
    const res = await request(buildApp()).get('/__routewatch/request-counts');
    expect(res.status).toBe(200);
    expect(res.body.window).toBe('5m');
    expect(res.body.counts['GET /users']).toBe(2);
  });

  it('rejects invalid window param', async () => {
    const res = await request(buildApp()).get('/__routewatch/request-counts?window=99h');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid window/);
  });
});

describe('GET /__routewatch/request-counts/top', () => {
  it('returns top routes sorted by count', async () => {
    recordRequestCountHit('GET', '/a');
    recordRequestCountHit('GET', '/a');
    recordRequestCountHit('POST', '/b');
    const res = await request(buildApp()).get('/__routewatch/request-counts/top?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.routes[0].route).toBe('GET /a');
    expect(res.body.routes[0].count).toBe(2);
  });
});

describe('GET /__routewatch/request-counts/:method/:path', () => {
  it('returns count for a specific route', async () => {
    recordRequestCountHit('GET', '/items');
    const res = await request(buildApp()).get('/__routewatch/request-counts/get/items?window=1h');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.route).toBe('GET /items');
  });
});

describe('DELETE /__routewatch/request-counts', () => {
  it('clears all request count data', async () => {
    recordRequestCountHit('GET', '/x');
    const res = await request(buildApp()).delete('/__routewatch/request-counts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const check = await request(buildApp()).get('/__routewatch/request-counts');
    expect(check.body.counts).toEqual({});
  });
});
