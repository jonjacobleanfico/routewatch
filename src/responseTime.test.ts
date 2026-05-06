import express from 'express';
import request from 'supertest';
import {
  recordResponseTime,
  getResponseTimeStats,
  getAllResponseTimeStats,
  clearResponseTimeLogs,
} from './responseTime';
import { responseTimeRouter } from './responseTimeRouter';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/response-times', responseTimeRouter);
  return app;
}

beforeEach(() => {
  clearResponseTimeLogs();
});

describe('recordResponseTime / getResponseTimeStats', () => {
  it('returns null for unknown route', () => {
    expect(getResponseTimeStats('GET', '/unknown')).toBeNull();
  });

  it('records and computes basic stats', () => {
    recordResponseTime('GET', '/api/users', 100);
    recordResponseTime('GET', '/api/users', 200);
    recordResponseTime('GET', '/api/users', 300);
    const stats = getResponseTimeStats('GET', '/api/users');
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(3);
    expect(stats!.min).toBe(100);
    expect(stats!.max).toBe(300);
    expect(stats!.avg).toBe(200);
  });

  it('computes p95 correctly', () => {
    for (let i = 1; i <= 20; i++) {
      recordResponseTime('POST', '/api/items', i * 10);
    }
    const stats = getResponseTimeStats('POST', '/api/items');
    expect(stats!.p95).toBeGreaterThanOrEqual(190);
  });
});

describe('getAllResponseTimeStats', () => {
  it('returns all tracked routes sorted by avg desc', () => {
    recordResponseTime('GET', '/fast', 50);
    recordResponseTime('GET', '/slow', 500);
    const all = getAllResponseTimeStats();
    expect(all.length).toBe(2);
    expect(all[0].route).toBe('/slow');
  });
});

describe('responseTimeRouter', () => {
  it('GET / returns all stats', async () => {
    recordResponseTime('GET', '/api/test', 120);
    const res = await request(buildApp()).get('/response-times/');
    expect(res.status).toBe(200);
    expect(res.body.stats.length).toBe(1);
  });

  it('GET /:method/:route returns stats for specific route', async () => {
    recordResponseTime('DELETE', '/api/item', 80);
    const res = await request(buildApp()).get('/response-times/DELETE/api/item');
    expect(res.status).toBe(200);
    expect(res.body.method).toBe('DELETE');
  });

  it('GET /:method/:route returns 404 for unknown route', async () => {
    const res = await request(buildApp()).get('/response-times/GET/nope');
    expect(res.status).toBe(404);
  });

  it('DELETE / clears all logs', async () => {
    recordResponseTime('GET', '/api/test', 100);
    const res = await request(buildApp()).delete('/response-times/');
    expect(res.status).toBe(200);
    expect(getAllResponseTimeStats().length).toBe(0);
  });
});
