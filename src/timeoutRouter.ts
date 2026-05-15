import { Router, Request, Response } from 'express';
import {
  setTimeoutRule,
  removeTimeoutRule,
  getTimeoutRule,
  getAllTimeoutRules,
  getTimeoutViolations,
  getViolationsByRoute,
  clearTimeoutData,
} from './routeTimeout';

const router = Router();

router.get('/timeout/rules', (_req: Request, res: Response) => {
  res.json(getAllTimeoutRules());
});

router.post('/timeout/rules', (req: Request, res: Response) => {
  const { method, path, timeoutMs, action } = req.body;
  if (!method || !path || typeof timeoutMs !== 'number') {
    return res.status(400).json({ error: 'method, path, and timeoutMs are required' });
  }
  setTimeoutRule(method, path, timeoutMs, action);
  res.status(201).json(getTimeoutRule(method, path));
});

router.delete('/timeout/rules', (req: Request, res: Response) => {
  const { method, path } = req.body;
  if (!method || !path) {
    return res.status(400).json({ error: 'method and path are required' });
  }
  const removed = removeTimeoutRule(method, path);
  res.json({ removed });
});

router.get('/timeout/violations', (req: Request, res: Response) => {
  const { method, path } = req.query;
  if (method && path) {
    return res.json(getViolationsByRoute(method as string, path as string));
  }
  res.json(getTimeoutViolations());
});

router.delete('/timeout/data', (_req: Request, res: Response) => {
  clearTimeoutData();
  res.json({ cleared: true });
});

export { router as timeoutRouter };
