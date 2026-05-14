import { Router, Request, Response } from 'express';
import {
  getChangelog,
  getChangelogForRoute,
  getChangelogByType,
  clearChangelog,
  ChangeType,
} from './routeChangelog';

const router = Router();

// GET /routewatch/changelog — full changelog, optional ?type= filter
router.get('/', (req: Request, res: Response) => {
  const type = req.query.type as ChangeType | undefined;
  if (type) {
    return res.json(getChangelogByType(type));
  }
  return res.json(getChangelog());
});

// GET /routewatch/changelog/route?method=GET&route=/api/users
router.get('/route', (req: Request, res: Response) => {
  const method = req.query.method as string | undefined;
  const route = req.query.route as string | undefined;
  if (!method || !route) {
    return res.status(400).json({ error: 'method and route query params are required' });
  }
  return res.json(getChangelogForRoute(method, route));
});

// DELETE /routewatch/changelog — clear all entries
router.delete('/', (_req: Request, res: Response) => {
  clearChangelog();
  return res.json({ message: 'Changelog cleared' });
});

export { router as changelogRouter };
