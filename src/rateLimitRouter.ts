import { Router, Request, Response } from 'express';
import { getStats } from './tracker';
import {
  addRateLimitRule,
  clearRateLimitRules,
  getRateLimitRules,
  evaluateRateLimits,
  RateLimitRule,
} from './rateLimit';

export const rateLimitRouter = Router();

rateLimitRouter.get('/rate-limits', (_req: Request, res: Response) => {
  const statsMap = getStats();
  const results = evaluateRateLimits(statsMap);
  res.json({ results });
});

rateLimitRouter.get('/rate-limits/rules', (_req: Request, res: Response) => {
  res.json({ rules: getRateLimitRules() });
});

rateLimitRouter.post('/rate-limits/rules', (req: Request, res: Response) => {
  const { route, method, maxHitsPerMinute } = req.body as Partial<RateLimitRule>;

  if (!route || !method || maxHitsPerMinute === undefined) {
    res.status(400).json({ error: 'route, method, and maxHitsPerMinute are required' });
    return;
  }

  if (typeof maxHitsPerMinute !== 'number' || maxHitsPerMinute <= 0) {
    res.status(400).json({ error: 'maxHitsPerMinute must be a positive number' });
    return;
  }

  addRateLimitRule({ route, method, maxHitsPerMinute });
  res.status(201).json({ message: 'Rate limit rule added', rule: { route, method, maxHitsPerMinute } });
});

rateLimitRouter.delete('/rate-limits/rules', (_req: Request, res: Response) => {
  clearRateLimitRules();
  res.json({ message: 'All rate limit rules cleared' });
});
