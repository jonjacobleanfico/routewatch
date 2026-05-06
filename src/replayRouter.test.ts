import express, { Application } from 'express';
import request from 'supertest';
import { replayRouter } from './replayRouter';
import { recordForReplay, clearReplayLog } from './replay';
import { RouteHit } from './tracker';

function makeHit(overrides: Partial<RouteHit> = {}): RouteHit {
  return {
    method: 'GET',
    path: '/api/test',
    statusCode: 200,
    duration: 15,
    timestamp: Date.now(),
    ...overrides,
  };
}

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use('/replay', replayRouter);
  return app;
}

beforeEach(() => {
  clearReplayLog();
});

describe('GET /replay', () => {
  it('returns empty log initially', async () => {
    const res = await request(buildApp()).get('/replay');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.hits).toEqual([]);
  });

  it('returns recorded hits', async () => {
    recordForReplay(makeHit());
    recordForReplay(makeHit({ path: '/other' }));
    const res = await request(buildApp()).get('/replay');
    expect(res.body.count).toBe(2);
  });
});

describe('POST /replay/run', () => {
  it('replays all hits when no filter given', async () => {
    recordForReplay(makeHit());
    recordForReplay(makeHit());
    const res = await request(buildApp()).post('/replay/run').send({});
    expect(res.status).toBe(200);
    expect(res.body.replayed).toBe(2);
  });

  it('replays only matching hits when method and path given', async () => {
    recordForReplay(makeHit({ method: 'GET', path: '/users' }));
    recordForReplay(makeHit({ method: 'POST', path: '/users' }));
    const res = await request(buildApp())
      .post('/replay/run')
      .send({ method: 'POST', path: '/users' });
    expect(res.body.replayed).toBe(1);
    expect(res.body.hits[0].method).toBe('POST');
  });
});

describe('DELETE /replay', () => {
  it('clears the replay log', async () => {
    recordForReplay(makeHit());
    const res = await request(buildApp()).delete('/replay');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cleared/i);
    const check = await request(buildApp()).get('/replay');
    expect(check.body.count).toBe(0);
  });
});
