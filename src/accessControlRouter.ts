import { Router, Request, Response } from 'express';
import {
  setAccessRule,
  getAccessRule,
  removeAccessRule,
  getAllAccessRules,
  clearAccessRules,
} from './routeAccessControl';

export const accessControlRouter = Router();

accessControlRouter.get('/access-rules', (_req: Request, res: Response) => {
  res.json(getAllAccessRules());
});

accessControlRouter.get('/access-rules/:method/:path(*)', (req: Request, res: Response) => {
  const { method, path } = req.params;
  const rule = getAccessRule(method, `/${path}`);
  if (!rule) {
    res.status(404).json({ error: 'No access rule found' });
    return;
  }
  res.json(rule);
});

accessControlRouter.post('/access-rules', (req: Request, res: Response) => {
  const { method, path, methods, roles } = req.body;
  if (!method || !path) {
    res.status(400).json({ error: 'method and path are required' });
    return;
  }
  setAccessRule(method, path, { methods, roles });
  res.status(201).json({ message: 'Access rule set', method, path });
});

accessControlRouter.delete('/access-rules/:method/:path(*)', (req: Request, res: Response) => {
  const { method, path } = req.params;
  const removed = removeAccessRule(method, `/${path}`);
  if (!removed) {
    res.status(404).json({ error: 'No access rule found' });
    return;
  }
  res.json({ message: 'Access rule removed' });
});

accessControlRouter.delete('/access-rules', (_req: Request, res: Response) => {
  clearAccessRules();
  res.json({ message: 'All access rules cleared' });
});
