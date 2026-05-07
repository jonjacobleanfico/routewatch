import express from 'express';
import request from 'supertest';
import { routewatch } from './middleware';
import { routeHealthRouter } from './routeHealthRouter';
import { resetStats, recordHit } from './tracker';
import { clearResponseTimeLogs, recordResponseTime } from './responseTime';
import { clearErrorLog, recordError } from './errorTracker';

function buildApp() {
  const app = express();
  app.use(routewatch());
  app.use('/__routewatch', routeHealthRouter);
  app.get('/api/users', (_req, res) => res.json([]));
  app.post('/api/items', (_req, res) => res.status(201).json({}));
  return app;
}

function makeHit(method: string, route: string, overrides = {}) {
  return { method, route, statusCode: 200, timestamp: Date.now(), ...overrides };
}

beforeEach(() => {
  resetStats();
  clearResponseTimeLogs();
  clearErrorLog();
});

describe('GET /__routewatch/health', () => {
  it('returns overall health summary', async () => {
    for (let i = 0; i < 10; i++) {
      recordHit(makeHit('GET', '/api/users'));
      recordResponseTime('GET', '/api/users', 150);
    }

    const app = buildApp();
    const res = await request(app).get('/__routewatch/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('overall');
    expect(res.body).toHaveProperty('routes');
    expect(Array.isArray(res.body.routes)).toBe(true);
  });

  it('includes score for each tracked route', async () => {
    for (let i = 0; i < 10; i++) {
      recordHit(makeHit('GET', '/api/users'));
      recordResponseTime('GET', '/api/users', 100);
    }

    const app = buildApp();
    const res = await request(app).get('/__routewatch/health');
    const routes = res.body.routes as Array<{ route: string; score: number }>;
    expect(routes.some((r) => r.route === '/api/users')).toBe(true);
  });

  it('returns 200 with empty routes when no stats recorded', async () => {
    const app = buildApp();
    const res = await request(app).get('/__routewatch/health');
    expect(res.status).toBe(200);
    expect(res.body.routes).toHaveLength(0);
    expect(res.body.overall).toBe(100);
  });
});

describe('GET /__routewatch/health/:method/:route', () => {
  it('returns health for a specific route', async () => {
    for (let i = 0; i < 10; i++) {
      recordHit(makeHit('GET', '/api/users'));
      recordResponseTime('GET', '/api/users', 200);
    }

    const app = buildApp();
    const res = await request(app).get('/__routewatch/health/GET/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('score');
    expect(res.body.method).toBe('GET');
  });

  it('returns 404 for unknown route', async () => {
    const app = buildApp();
    const res = await request(app).get('/__routewatch/health/GET/api/unknown');
    expect(res.status).toBe(404);
  });
});
