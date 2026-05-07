import { Router } from 'express';
import {
  getAllAuthStats,
  getAuthStats,
  getAuthLog,
  getFailureRate,
  clearAuthLog,
} from './authTracker';

export const authTrackerRouter = Router();

// GET /auth-tracker/stats — all routes
authTrackerRouter.get('/stats', (_req, res) => {
  res.json(getAllAuthStats());
});

// GET /auth-tracker/stats/:method/:path — single route
authTrackerRouter.get('/stats/:method/*', (req, res) => {
  const method = req.params.method;
  const path = '/' + (req.params as Record<string, string>)[0];
  const stats = getAuthStats(method, path);
  if (!stats) {
    return res.status(404).json({ error: 'No auth stats for this route' });
  }
  res.json(stats);
});

// GET /auth-tracker/failure-rate/:method/:path
authTrackerRouter.get('/failure-rate/:method/*', (req, res) => {
  const method = req.params.method;
  const path = '/' + (req.params as Record<string, string>)[0];
  const rate = getFailureRate(method, path);
  if (rate === null) {
    return res.status(404).json({ error: 'No auth data for this route' });
  }
  res.json({ method, path, failureRate: rate });
});

// GET /auth-tracker/log — raw event log
authTrackerRouter.get('/log', (_req, res) => {
  res.json(getAuthLog());
});

// DELETE /auth-tracker/log — clear log
authTrackerRouter.delete('/log', (_req, res) => {
  clearAuthLog();
  res.json({ message: 'Auth log cleared' });
});
