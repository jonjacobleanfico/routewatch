import express, { Express } from 'express';
import request from 'supertest';
import { tagsRouter } from './tagsRouter';
import { clearTags } from './tags';

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/tags', tagsRouter);
  return app;
}

beforeEach(() => {
  clearTags();
});

describe('GET /tags', () => {
  it('returns empty object when no tags set', async () => {
    const res = await request(buildApp()).get('/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('returns all tag assignments after adding', async () => {
    const app = buildApp();
    await request(app).post('/tags').send({ route: '/api/users GET', tags: ['auth'] });
    const res = await request(app).get('/tags');
    expect(res.body['/api/users GET']).toContain('auth');
  });
});

describe('GET /tags/by/:tag', () => {
  it('returns routes for a tag', async () => {
    const app = buildApp();
    await request(app).post('/tags').send({ route: '/api/users GET', tags: ['auth'] });
    const res = await request(app).get('/tags/by/auth');
    expect(res.status).toBe(200);
    expect(res.body.routes).toContain('/api/users GET');
  });
});

describe('GET /tags/route', () => {
  it('returns tags for a specific route', async () => {
    const app = buildApp();
    await request(app).post('/tags').send({ route: '/api/users GET', tags: ['auth', 'public'] });
    const res = await request(app).get('/tags/route?route=/api/users GET');
    expect(res.status).toBe(200);
    expect(res.body.tags).toContain('auth');
  });

  it('returns 400 when route query param is missing', async () => {
    const res = await request(buildApp()).get('/tags/route');
    expect(res.status).toBe(400);
  });
});

describe('POST /tags', () => {
  it('adds tags and returns updated list', async () => {
    const res = await request(buildApp())
      .post('/tags')
      .send({ route: '/api/orders POST', tags: ['billing', 'auth'] });
    expect(res.status).toBe(201);
    expect(res.body.tags).toContain('billing');
    expect(res.body.tags).toContain('auth');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(buildApp()).post('/tags').send({ route: '/api/orders POST' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /tags', () => {
  it('removes a tag from a route', async () => {
    const app = buildApp();
    await request(app).post('/tags').send({ route: '/api/users GET', tags: ['auth', 'public'] });
    const res = await request(app).delete('/tags').send({ route: '/api/users GET', tag: 'auth' });
    expect(res.status).toBe(200);
    expect(res.body.tags).not.toContain('auth');
    expect(res.body.tags).toContain('public');
  });
});

describe('DELETE /tags/all', () => {
  it('clears all tags', async () => {
    const app = buildApp();
    await request(app).post('/tags').send({ route: '/api/users GET', tags: ['auth'] });
    await request(app).delete('/tags/all');
    const res = await request(app).get('/tags');
    expect(res.body).toEqual({});
  });
});
