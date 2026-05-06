import express from 'express';
import request from 'supertest';
import { heatmapRouter } from './heatmapRouter';
import { recordHeatmapHit, clearHeatmapData } from './heatmap';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/_routewatch', heatmapRouter);
  return app;
}

function makeHit(route: string, day: number, hour: number) {
  const date = new Date(2024, 0, 7 + day);
  date.setHours(hour, 0, 0, 0);
  recordHeatmapHit(route, 'GET', date);
}

beforeEach(() => {
  clearHeatmapData();
});

describe('GET /_routewatch/heatmap', () => {
  it('returns heatmap data with 168 cells', async () => {
    const res = await request(buildApp()).get('/_routewatch/heatmap');
    expect(res.status).toBe(200);
    expect(res.body.cells).toHaveLength(168);
    expect(res.body.maxCount).toBe(0);
  });

  it('accepts route query param', async () => {
    makeHit('/api/users', 1, 10);
    const res = await request(buildApp()).get('/_routewatch/heatmap?route=/api/users');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('/api/users');
    const cell = res.body.cells.find((c: any) => c.day === 1 && c.hour === 10);
    expect(cell.count).toBe(1);
  });
});

describe('GET /_routewatch/heatmap/top-hours', () => {
  it('returns top hours', async () => {
    makeHit('/api/test', 0, 9);
    makeHit('/api/test', 1, 9);
    const res = await request(buildApp()).get('/_routewatch/heatmap/top-hours');
    expect(res.status).toBe(200);
    expect(res.body.topHours[0].hour).toBe(9);
  });

  it('respects limit query param', async () => {
    for (let i = 0; i < 10; i++) makeHit('/api/test', 0, i);
    const res = await request(buildApp()).get('/_routewatch/heatmap/top-hours?limit=3');
    expect(res.status).toBe(200);
    expect(res.body.topHours).toHaveLength(3);
  });

  it('returns 400 for invalid limit', async () => {
    const res = await request(buildApp()).get('/_routewatch/heatmap/top-hours?limit=abc');
    expect(res.status).toBe(400);
  });
});

describe('DELETE /_routewatch/heatmap', () => {
  it('clears heatmap data', async () => {
    makeHit('/api/test', 0, 10);
    const del = await request(buildApp()).delete('/_routewatch/heatmap');
    expect(del.status).toBe(200);
    const get = await request(buildApp()).get('/_routewatch/heatmap');
    expect(get.body.maxCount).toBe(0);
  });
});
