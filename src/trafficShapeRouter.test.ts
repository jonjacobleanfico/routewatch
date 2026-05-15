import express from 'express';
import request from 'supertest';
import { trafficShapeRouter } from './trafficShapeRouter';
import { recordTrafficHit, clearTrafficShapeLog } from './routeTrafficShape';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/routewatch/traffic-shape', trafficShapeRouter);
  return app;
}

beforeEach(() => {
  clearTrafficShapeLog();
});

describe('GET /routewatch/traffic-shape', () => {
  it('returns empty shapes array when no data', async () => {
    const res = await request(buildApp()).get('/routewatch/traffic-shape');
    expect(res.status).toBe(200);
    expect(res.body.shapes).toEqual([]);
  });

  it('returns shapes for recorded routes', async () => {
    recordTrafficHit('GET', '/api/test');
    const res = await request(buildApp()).get('/routewatch/traffic-shape');
    expect(res.status).toBe(200);
    expect(res.body.shapes.length).toBe(1);
    expect(res.body.shapes[0].route).toBe('GET /api/test');
  });
});

describe('GET /routewatch/traffic-shape/:method/*', () => {
  it('returns 404 for unknown route', async () => {
    const res = await request(buildApp()).get('/routewatch/traffic-shape/GET/api/missing');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('returns shape entry for known route', async () => {
    recordTrafficHit('GET', '/api/users');
    const res = await request(buildApp()).get('/routewatch/traffic-shape/GET/api/users');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('GET /api/users');
    expect(res.body.shape).toBeDefined();
    expect(Array.isArray(res.body.windows)).toBe(true);
  });
});

describe('DELETE /routewatch/traffic-shape', () => {
  it('clears all traffic shape data', async () => {
    recordTrafficHit('DELETE', '/api/items');
    const app = buildApp();
    const delRes = await request(app).delete('/routewatch/traffic-shape');
    expect(delRes.status).toBe(200);
    expect(delRes.body.message).toMatch(/cleared/i);
    const getRes = await request(app).get('/routewatch/traffic-shape');
    expect(getRes.body.shapes).toHaveLength(0);
  });
});
