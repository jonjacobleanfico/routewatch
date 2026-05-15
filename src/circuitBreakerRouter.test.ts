import express from 'express';
import request from 'supertest';
import circuitBreakerRouter from './circuitBreakerRouter';
import { clearAllCircuits, setCircuitBreakerRule, recordCircuitResult } from './routeCircuitBreaker';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/routewatch/circuit-breaker', circuitBreakerRouter);
  return app;
}

beforeEach(() => clearAllCircuits());

describe('GET /routewatch/circuit-breaker', () => {
  it('returns empty object when no circuits', async () => {
    const res = await request(buildApp()).get('/routewatch/circuit-breaker');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('returns all circuits', async () => {
    setCircuitBreakerRule('GET', '/api/test', { failureThreshold: 3, successThreshold: 2, timeoutMs: 1000 });
    const res = await request(buildApp()).get('/routewatch/circuit-breaker');
    expect(res.status).toBe(200);
    expect(res.body['GET:/api/test']).toBeDefined();
  });
});

describe('POST /routewatch/circuit-breaker', () => {
  it('creates a circuit breaker rule', async () => {
    const res = await request(buildApp())
      .post('/routewatch/circuit-breaker')
      .send({ method: 'GET', path: '/api/items', failureThreshold: 5, successThreshold: 2, timeoutMs: 5000 });
    expect(res.status).toBe(201);
    expect(res.body.rule.failureThreshold).toBe(5);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(buildApp())
      .post('/routewatch/circuit-breaker')
      .send({ method: 'GET' });
    expect(res.status).toBe(400);
  });
});

describe('GET /routewatch/circuit-breaker/:method/*', () => {
  it('returns 404 for unknown route', async () => {
    const res = await request(buildApp()).get('/routewatch/circuit-breaker/GET/api/unknown');
    expect(res.status).toBe(404);
  });

  it('returns circuit entry for known route', async () => {
    setCircuitBreakerRule('GET', '/api/known', { failureThreshold: 3, successThreshold: 2, timeoutMs: 1000 });
    const res = await request(buildApp()).get('/routewatch/circuit-breaker/GET/api/known');
    expect(res.status).toBe(200);
    expect(res.body.state).toBe('CLOSED');
  });
});

describe('POST /routewatch/circuit-breaker/reset/:method/*', () => {
  it('resets a tripped circuit', async () => {
    setCircuitBreakerRule('GET', '/api/tripped', { failureThreshold: 1, successThreshold: 2, timeoutMs: 60000 });
    recordCircuitResult('GET', '/api/tripped', false);
    const res = await request(buildApp()).post('/routewatch/circuit-breaker/reset/GET/api/tripped');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset/i);
  });
});

describe('DELETE /routewatch/circuit-breaker', () => {
  it('clears all circuits', async () => {
    setCircuitBreakerRule('GET', '/api/a', { failureThreshold: 3, successThreshold: 2, timeoutMs: 1000 });
    const res = await request(buildApp()).delete('/routewatch/circuit-breaker');
    expect(res.status).toBe(200);
    const check = await request(buildApp()).get('/routewatch/circuit-breaker');
    expect(check.body).toEqual({});
  });
});
