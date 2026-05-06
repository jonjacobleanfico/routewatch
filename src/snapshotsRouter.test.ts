import express from 'express';
import request from 'supertest';
import { snapshotsRouter } from './snapshotsRouter';
import { resetStats, recordHit } from './tracker';
import { clearSnapshots } from './snapshots';

function makeHit(route: string, method = 'GET', status = 200, duration = 40) {
  return { route, method, status, duration, timestamp: new Date().toISOString() };
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/snapshots', snapshotsRouter);
  return app;
}

beforeEach(() => {
  resetStats();
  clearSnapshots();
});

test('POST /snapshots creates a snapshot', async () => {
  recordHit(makeHit('/api/test'));
  const res = await request(buildApp()).post('/snapshots').send({ label: 'my snap' });
  expect(res.status).toBe(201);
  expect(res.body.label).toBe('my snap');
  expect(res.body.id).toMatch(/^snap_/);
});

test('GET /snapshots lists all snapshots', async () => {
  const app = buildApp();
  await request(app).post('/snapshots').send({});
  await request(app).post('/snapshots').send({});
  const res = await request(app).get('/snapshots');
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(2);
});

test('GET /snapshots/:id returns a snapshot', async () => {
  const app = buildApp();
  const created = await request(app).post('/snapshots').send({ label: 'test' });
  const res = await request(app).get(`/snapshots/${created.body.id}`);
  expect(res.status).toBe(200);
  expect(res.body.label).toBe('test');
});

test('GET /snapshots/:id returns 404 for unknown id', async () => {
  const res = await request(buildApp()).get('/snapshots/unknown');
  expect(res.status).toBe(404);
});

test('DELETE /snapshots/:id removes a snapshot', async () => {
  const app = buildApp();
  const created = await request(app).post('/snapshots').send({});
  const res = await request(app).delete(`/snapshots/${created.body.id}`);
  expect(res.status).toBe(200);
  const check = await request(app).get(`/snapshots/${created.body.id}`);
  expect(check.status).toBe(404);
});

test('GET /snapshots/diff/:idA/:idB returns diff', async () => {
  const app = buildApp();
  recordHit(makeHit('/api/x'));
  const a = await request(app).post('/snapshots').send({});
  recordHit(makeHit('/api/x'));
  const b = await request(app).post('/snapshots').send({});
  const res = await request(app).get(`/snapshots/diff/${a.body.id}/${b.body.id}`);
  expect(res.status).toBe(200);
  expect(res.body['/api/x GET']).toBeDefined();
});
