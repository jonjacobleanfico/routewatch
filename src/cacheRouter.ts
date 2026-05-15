import { Router } from 'express';
import {
  setCacheRule,
  removeCacheRule,
  getCacheStats,
  getAllCacheStats,
  clearCacheStats,
  CacheRule,
} from './routeCache';

const router = Router();

// GET /routewatch/cache - list all cache rules and stats
router.get('/', (_req, res) => {
  res.json(getAllCacheStats());
});

// GET /routewatch/cache/:method/:path - get stats for a specific route
router.get('/:method/*', (req, res) => {
  const method = req.params.method;
  const path = '/' + (req.params as any)[0];
  const entry = getCacheStats(method, path);
  if (!entry) {
    return res.status(404).json({ error: 'No cache rule found for this route' });
  }
  res.json(entry);
});

// POST /routewatch/cache - add or update a cache rule
router.post('/', (req, res) => {
  const { method, path, ttl, maxSize } = req.body as {
    method?: string;
    path?: string;
    ttl?: number;
    maxSize?: number;
  };
  if (!method || !path || typeof ttl !== 'number') {
    return res.status(400).json({ error: 'method, path, and ttl are required' });
  }
  const rule: CacheRule = { ttl };
  if (maxSize !== undefined) rule.maxSize = maxSize;
  setCacheRule(method, path, rule);
  res.status(201).json({ method: method.toUpperCase(), path, rule });
});

// DELETE /routewatch/cache/:method/:path - remove a cache rule
router.delete('/:method/*', (req, res) => {
  const method = req.params.method;
  const path = '/' + (req.params as any)[0];
  const removed = removeCacheRule(method, path);
  if (!removed) {
    return res.status(404).json({ error: 'No cache rule found for this route' });
  }
  res.json({ removed: true, method: method.toUpperCase(), path });
});

// DELETE /routewatch/cache - clear all cache stats and rules
router.delete('/', (_req, res) => {
  clearCacheStats();
  res.json({ cleared: true });
});

export { router as cacheRouter };
