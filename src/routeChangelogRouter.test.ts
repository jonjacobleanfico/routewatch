import express from 'express';
import request from 'supertest';
import { changelogRouter } from './routeChangelogRouter';
import { recordChange, clearChangelog } from './routeChangelog';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/routewatch/changelog', changelogRouter);
  return app;
}

beforeEach(() => {
  clearChangelog();
});

describe('GET /routewatch/changelog', () => {
  it('returns empty array when no entries', async () => {
    const res = await request(buildApp()).get('/routewatch/changelog');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all entries', async () => {
    recordChange('GET', '/api/users', 'deprecated');
    recordChange('POST', '/api/items', 'tag_added', 'v2');
    const res = await request(buildApp()).get('/routewatch/changelog');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters by type when ?type= is provided', async () => {
    recordChange('GET', '/a', 'deprecated');
    recordChange('GET', '/b', 'alias_set');
    const res = await request(buildApp()).get('/routewatch/changelog?type=deprecated');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].changeType).toBe('deprecated');
  });
});

describe('GET /routewatch/changelog/route', () => {
  it('returns 400 if method or route missing', async () => {
    const res = await request(buildApp()).get('/routewatch/changelog/route?method=GET');
    expect(res.status).toBe(400);
  });

  it('returns entries for the specified route', async () => {
    recordChange('GET', '/api/users', 'deprecated');
    recordChange('GET', '/api/users', 'tag_added', 'legacy');
    recordChange('POST', '/api/users', 'note_added');
    const res = await request(buildApp()).get(
      '/routewatch/changelog/route?method=GET&route=/api/users'
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('DELETE /routewatch/changelog', () => {
  it('clears all entries', async () => {
    recordChange('GET', '/a', 'deprecated');
    const del = await request(buildApp()).delete('/routewatch/changelog');
    expect(del.status).toBe(200);
    expect(del.body.message).toBe('Changelog cleared');
    const get = await request(buildApp()).get('/routewatch/changelog');
    expect(get.body).toEqual([]);
  });
});
