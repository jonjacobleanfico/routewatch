import express from 'express';
import request from 'supertest';
import { cacheRouter } from './cacheRouter';
import { clearCacheStats, recordCacheHit } from './routeCache';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/routewatch/cache', cacheRouter);
  return app;
}

beforeEach(() => clearCacheStats());

describe('GET /routewatch/cache', () => {
  it('returns empty array when no rules set', async () => {
    const res = await request(buildApp()).get('/routewatch/cache');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all cache entries', async () => {
    const app = buildApp();
    await request(app).post('/routewatch/cache').send({ method: 'GET', path: '/api/users', ttl: 60 });
    const res = await request(app).get('/routewatch/cache');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].route).toBe('/api/users');
  });
});

describe('POST /routewatch/cache', () => {
  it('creates a cache rule', async () => {
    const res = await request(buildApp())
      .post('/routewatch/cache')
      .send({ method: 'GET', path: '/api/items', ttl: 30, maxSize: 50 });
    expect(res.status).toBe(201);
    expect(res.body.rule).toEqual({ ttl: 30, maxSize: 50 });
    expect(res.body.method).toBe('GET');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(buildApp())
      .post('/routewatch/cache')
      .send({ method: 'GET' });
    expect(res.status).toBe(400);
  });
});

describe('GET /routewatch/cache/:method/*', () => {
  it('returns stats for a specific route', async () => {
    const app = buildApp();
    await request(app).post('/routewatch/cache').send({ method: 'GET', path: '/api/posts', ttl: 45 });
    recordCacheHit('GET', '/api/posts', true);
    const res = await request(app).get('/routewatch/cache/GET/api/posts');
    expect(res.status).toBe(200);
    expect(res.body.hits).toBe(1);
    expect(res.body.misses).toBe(0);
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(buildApp()).get('/routewatch/cache/GET/no-such-route');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /routewatch/cache/:method/*', () => {
  it('removes an existing rule', async () => {
    const app = buildApp();
    await request(app).post('/routewatch/cache').send({ method: 'GET', path: '/api/data', ttl: 10 });
    const res = await request(app).delete('/routewatch/cache/GET/api/data');
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(true);
  });

  it('returns 404 when rule does not exist', async () => {
    const res = await request(buildApp()).delete('/routewatch/cache/GET/api/missing');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /routewatch/cache', () => {
  it('clears all rules', async () => {
    const app = buildApp();
    await request(app).post('/routewatch/cache').send({ method: 'GET', path: '/api/x', ttl: 5 });
    const res = await request(app).delete('/routewatch/cache');
    expect(res.status).toBe(200);
    expect(res.body.cleared).toBe(true);
    const list = await request(app).get('/routewatch/cache');
    expect(list.body).toEqual([]);
  });
});
