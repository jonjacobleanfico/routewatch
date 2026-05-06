/**
 * tagsRouter.ts — Express router exposing tag management endpoints
 */

import { Router, Request, Response } from 'express';
import {
  addTag,
  removeTag,
  getTagsForRoute,
  getRoutesByTag,
  getAllTags,
  clearTags,
} from './tags';

export const tagsRouter = Router();

// GET /tags — list all tag assignments
tagsRouter.get('/', (_req: Request, res: Response) => {
  res.json(getAllTags());
});

// GET /tags/by/:tag — list routes with a specific tag
tagsRouter.get('/by/:tag', (req: Request, res: Response) => {
  const routes = getRoutesByTag(req.params.tag);
  res.json({ tag: req.params.tag, routes });
});

// GET /tags/route — list tags for a route (route passed as query param)
tagsRouter.get('/route', (req: Request, res: Response) => {
  const route = req.query.route as string;
  if (!route) {
    return res.status(400).json({ error: 'Missing ?route= query parameter' });
  }
  res.json({ route, tags: getTagsForRoute(route) });
});

// POST /tags — add tags to a route
// body: { route: string, tags: string[] }
tagsRouter.post('/', (req: Request, res: Response) => {
  const { route, tags } = req.body as { route?: string; tags?: string[] };
  if (!route || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ error: 'Provide route (string) and tags (string[])' });
  }
  addTag(route, ...tags);
  res.status(201).json({ route, tags: getTagsForRoute(route) });
});

// DELETE /tags — remove a tag from a route
// body: { route: string, tag: string }
tagsRouter.delete('/', (req: Request, res: Response) => {
  const { route, tag } = req.body as { route?: string; tag?: string };
  if (!route || !tag) {
    return res.status(400).json({ error: 'Provide route and tag' });
  }
  removeTag(route, tag);
  res.json({ route, tags: getTagsForRoute(route) });
});

// DELETE /tags/all — clear all tags
tagsRouter.delete('/all', (_req: Request, res: Response) => {
  clearTags();
  res.json({ cleared: true });
});
