import express from 'express';
import request from 'supertest';
import { exportStats, exporterRouter } from './exporter';
import { RouteStats } from './tracker';

function makeStats(overrides: Partial<RouteStats> = {}): RouteStats {
  return {
    method: 'GET',
    path: '/api/test',
    hitCount: 5,
    avgDurationMs: 42.5,
    lastHitAt: new Date('2024-01-15T10:00:00.000Z'),
    ...overrides,
  };
}

describe('exportStats', () => {
  const stats = [makeStats(), makeStats({ method: 'POST', path: '/api/items', hitCount: 3 })];

  describe('json format', () => {
    it('returns valid JSON', () => {
      const result = exportStats(stats, 'json');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('includes exportedAt, totalRoutes, totalHits, and routes', () => {
      const parsed = JSON.parse(exportStats(stats, 'json'));
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed.totalRoutes).toBe(2);
      expect(parsed.totalHits).toBe(8);
      expect(parsed.routes).toHaveLength(2);
    });
  });

  describe('csv format', () => {
    it('returns a string with comma-separated values', () => {
      const result = exportStats(stats, 'csv');
      const lines = result.split('\n');
      expect(lines[0]).toBe('method,path,hitCount,avgDurationMs,lastHitAt');
      expect(lines).toHaveLength(3);
    });

    it('includes correct values for each row', () => {
      const result = exportStats(stats, 'csv');
      const lines = result.split('\n');
      expect(lines[1]).toContain('GET');
      expect(lines[1]).toContain('/api/test');
      expect(lines[1]).toContain('5');
    });
  });
});

describe('exporterRouter', () => {
  const stats = [makeStats()];
  const app = express();
  app.use(exporterRouter(() => stats));

  it('GET /routewatch/export returns JSON by default', async () => {
    const res = await request(app).get('/routewatch/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    const body = JSON.parse(res.text);
    expect(body.totalRoutes).toBe(1);
  });

  it('GET /routewatch/export?format=csv returns CSV', async () => {
    const res = await request(app).get('/routewatch/export?format=csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('method,path,hitCount');
  });
});
