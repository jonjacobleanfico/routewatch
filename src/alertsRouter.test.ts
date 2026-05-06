import express from 'express';
import request from 'supertest';
import { alertsRouter, addAlertRule, clearAlertRules } from './alertsRouter';
import { resetStats, recordHit } from './tracker';

function buildApp() {
  const app = express();
  app.use('/__routewatch/alerts', alertsRouter);
  return app;
}

function makeHit(overrides: Partial<Parameters<typeof recordHit>[0]> = {}) {
  return {
    method: 'GET',
    route: '/api/test',
    statusCode: 200,
    duration: 100,
    ...overrides,
  };
}

describe('alertsRouter', () => {
  beforeEach(() => {
    resetStats();
    clearAlertRules();
  });

  it('GET / returns empty alerts when no issues', async () => {
    recordHit(makeHit());
    const app = buildApp();
    const res = await request(app).get('/__routewatch/alerts');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.alerts).toEqual([]);
  });

  it('GET / returns triggered alerts for slow routes', async () => {
    recordHit(makeHit({ duration: 2000 }));
    const app = buildApp();
    const res = await request(app).get('/__routewatch/alerts');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('GET /all returns all evaluated results', async () => {
    recordHit(makeHit());
    const app = buildApp();
    const res = await request(app).get('/__routewatch/alerts/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it('GET /summary groups alerts by ruleId', async () => {
    recordHit(makeHit({ duration: 2000 }));
    const app = buildApp();
    const res = await request(app).get('/__routewatch/alerts/summary');
    expect(res.status).toBe(200);
    expect(res.body['slow-response']).toBeDefined();
  });

  it('respects custom alert rules', async () => {
    addAlertRule({
      id: 'always-fire',
      description: 'Always triggers',
      check: () => true,
    });
    recordHit(makeHit());
    const app = buildApp();
    const res = await request(app).get('/__routewatch/alerts');
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.alerts[0].ruleId).toBe('always-fire');
  });
});
