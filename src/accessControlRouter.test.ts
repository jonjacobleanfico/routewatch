import express from 'express';
import request from 'supertest';
import { accessControlRouter } from './accessControlRouter';
import { clearAccessRules } from './routeAccessControl';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/__routewatch', accessControlRouter);
  return app;
}

beforeEach(() => {
  clearAccessRules();
});

describe('GET /__routewatch/access-rules', () => {
  it('returns empty object initially', async () => {
    const res = await request(buildApp()).get('/__routewatch/access-rules');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });
});

describe('POST /__routewatch/access-rules', () => {
  it('creates a rule', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/access-rules')
      .send({ method: 'GET', path: '/users', roles: ['admin'] });
    expect(res.status).toBe(201);
    expect(res.body.method).toBe('GET');
  });

  it('returns 400 when method or path missing', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/access-rules')
      .send({ roles: ['admin'] });
    expect(res.status).toBe(400);
  });
});

describe('GET /__routewatch/access-rules/:method/:path', () => {
  it('returns a specific rule', async () => {
    const app = buildApp();
    await request(app)
      .post('/__routewatch/access-rules')
      .send({ method: 'GET', path: '/users', roles: ['admin'] });
    const res = await request(app).get('/__routewatch/access-rules/GET/users');
    expect(res.status).toBe(200);
    expect(res.body.roles).toContain('admin');
  });

  it('returns 404 when not found', async () => {
    const res = await request(buildApp()).get('/__routewatch/access-rules/POST/unknown');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /__routewatch/access-rules/:method/:path', () => {
  it('removes a rule', async () => {
    const app = buildApp();
    await request(app)
      .post('/__routewatch/access-rules')
      .send({ method: 'GET', path: '/users', roles: ['admin'] });
    const res = await request(app).delete('/__routewatch/access-rules/GET/users');
    expect(res.status).toBe(200);
  });

  it('returns 404 when rule not found', async () => {
    const res = await request(buildApp()).delete('/__routewatch/access-rules/GET/nope');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /__routewatch/access-rules', () => {
  it('clears all rules', async () => {
    const app = buildApp();
    await request(app)
      .post('/__routewatch/access-rules')
      .send({ method: 'GET', path: '/users', roles: ['admin'] });
    await request(app).delete('/__routewatch/access-rules');
    const res = await request(app).get('/__routewatch/access-rules');
    expect(res.body).toEqual({});
  });
});
