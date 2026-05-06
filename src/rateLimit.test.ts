import express from 'express';
import request from 'supertest';
import { RouteStats, Hit } from './tracker';
import {
  addRateLimitRule,
  clearRateLimitRules,
  evaluateRateLimits,
  getRateLimitRules,
} from './rateLimit';
import { rateLimitRouter } from './rateLimitRouter';

function makeHit(minsAgo: number): Hit {
  return {
    timestamp: new Date(Date.now() - minsAgo * 60_000).toISOString(),
    statusCode: 200,
    duration: 10,
  };
}

function makeStats(hits: Hit[]): RouteStats {
  return { hits, avgDuration: 10, count: hits.length };
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/__routewatch', rateLimitRouter);
  return app;
}

beforeEach(() => clearRateLimitRules());

describe('evaluateRateLimits', () => {
  it('returns exceeded=true when recent hits exceed limit', () => {
    addRateLimitRule({ route: '/api/data', method: 'GET', maxHitsPerMinute: 2 });
    const statsMap = new Map<string, RouteStats>();
    statsMap.set('GET:/api/data', makeStats([makeHit(0), makeHit(0), makeHit(0)]));
    const results = evaluateRateLimits(statsMap);
    expect(results).toHaveLength(1);
    expect(results[0].exceeded).toBe(true);
    expect(results[0].hitsPerMinute).toBe(3);
  });

  it('returns exceeded=false when hits are within limit', () => {
    addRateLimitRule({ route: '/api/data', method: 'GET', maxHitsPerMinute: 5 });
    const statsMap = new Map<string, RouteStats>();
    statsMap.set('GET:/api/data', makeStats([makeHit(0), makeHit(0)]));
    const results = evaluateRateLimits(statsMap);
    expect(results[0].exceeded).toBe(false);
  });

  it('ignores hits older than one minute', () => {
    addRateLimitRule({ route: '/api/old', method: 'POST', maxHitsPerMinute: 1 });
    const statsMap = new Map<string, RouteStats>();
    statsMap.set('POST:/api/old', makeStats([makeHit(2), makeHit(3)]));
    const results = evaluateRateLimits(statsMap);
    expect(results[0].hitsPerMinute).toBe(0);
    expect(results[0].exceeded).toBe(false);
  });

  it('skips routes with no matching stats', () => {
    addRateLimitRule({ route: '/missing', method: 'GET', maxHitsPerMinute: 1 });
    const statsMap = new Map<string, RouteStats>();
    const results = evaluateRateLimits(statsMap);
    expect(results).toHaveLength(0);
  });
});

describe('rateLimitRouter', () => {
  it('POST /rate-limits/rules adds a rule and GET returns it', async () => {
    const app = buildApp();
    await request(app)
      .post('/__routewatch/rate-limits/rules')
      .send({ route: '/test', method: 'GET', maxHitsPerMinute: 10 })
      .expect(201);
    const res = await request(app).get('/__routewatch/rate-limits/rules').expect(200);
    expect(res.body.rules).toHaveLength(1);
    expect(res.body.rules[0].route).toBe('/test');
  });

  it('POST /rate-limits/rules returns 400 for invalid payload', async () => {
    const app = buildApp();
    await request(app)
      .post('/__routewatch/rate-limits/rules')
      .send({ route: '/test' })
      .expect(400);
  });

  it('DELETE /rate-limits/rules clears all rules', async () => {
    addRateLimitRule({ route: '/x', method: 'GET', maxHitsPerMinute: 5 });
    const app = buildApp();
    await request(app).delete('/__routewatch/rate-limits/rules').expect(200);
    expect(getRateLimitRules()).toHaveLength(0);
  });
});
