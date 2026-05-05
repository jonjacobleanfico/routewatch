import request from 'supertest';
import express, { Application } from 'express';
import { dashboardRouter } from './dashboard';
import * as tracker from './tracker';

function makeHit(method: string, path: string, status: number, duration: number) {
  return { method, path, status, duration, timestamp: Date.now() };
}

const mockStats = [
  makeHit('GET', '/api/users', 200, 45),
  makeHit('GET', '/api/users', 200, 30),
  makeHit('POST', '/api/users', 201, 80),
  makeHit('GET', '/api/posts', 404, 12),
];

function buildApp(options = {}): Application {
  const app = express();
  app.use(dashboardRouter(options));
  return app;
}

describe('dashboardRouter', () => {
  beforeEach(() => {
    jest.spyOn(tracker, 'getStats').mockReturnValue(mockStats as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('serves HTML dashboard at default path', async () => {
    const app = buildApp();
    const res = await request(app).get('/__routewatch');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('RouteWatch Dashboard');
    expect(res.text).toContain('Total routes tracked');
  });

  it('serves JSON report when format is json', async () => {
    const app = buildApp({ format: 'json' });
    const res = await request(app).get('/__routewatch');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('totalHits');
    expect(res.body).toHaveProperty('totalRoutes');
  });

  it('serves plain text table when format is table', async () => {
    const app = buildApp({ format: 'table' });
    const res = await request(app).get('/__routewatch');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text.length).toBeGreaterThan(0);
  });

  it('mounts at a custom path', async () => {
    const app = buildApp({ path: '/dev/routes', format: 'json' });
    const notFound = await request(app).get('/__routewatch');
    expect(notFound.status).toBe(404);
    const found = await request(app).get('/dev/routes');
    expect(found.status).toBe(200);
  });
});
