import { Router } from 'express';
import {
  getCorsViolations,
  getCorsViolationsByRoute,
  clearCorsViolations,
  setAllowedOrigins,
  getAllowedOrigins,
} from './cors';

const corsRouter = Router();

corsRouter.get('/violations', (_req, res) => {
  res.json(getCorsViolations());
});

corsRouter.get('/violations/by-route', (_req, res) => {
  res.json(getCorsViolationsByRoute());
});

corsRouter.delete('/violations', (_req, res) => {
  clearCorsViolations();
  res.json({ cleared: true });
});

corsRouter.get('/allowed-origins', (_req, res) => {
  res.json({ origins: getAllowedOrigins() });
});

corsRouter.post('/allowed-origins', (req, res) => {
  const { origins } = req.body;
  if (!Array.isArray(origins)) {
    return res.status(400).json({ error: 'origins must be an array' });
  }
  setAllowedOrigins(origins);
  res.json({ origins: getAllowedOrigins() });
});

export { corsRouter };
