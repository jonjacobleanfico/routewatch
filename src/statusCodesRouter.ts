import { Router } from 'express';
import {
  getAllStatusCodeStats,
  getStatusCodeStats,
  getStatusCodeSummary,
  clearStatusCodeLogs,
} from './statusCodes';

export const statusCodesRouter = Router();

/**
 * GET /routewatch/status-codes
 * Returns status code distribution for all routes.
 */
statusCodesRouter.get('/', (_req, res) => {
  const stats = getAllStatusCodeStats();
  res.json(stats);
});

/**
 * GET /routewatch/status-codes/:method/:path
 * Returns status code stats for a specific route.
 * e.g. GET /routewatch/status-codes/GET/api%2Fusers
 */
statusCodesRouter.get('/:method/:routePath', (req, res) => {
  const { method, routePath } = req.params;
  const decoded = decodeURIComponent(routePath);
  const summary = getStatusCodeSummary(method, decoded);
  const breakdown = getStatusCodeStats(method, decoded);

  if (Object.keys(breakdown).length === 0) {
    return res.status(404).json({ error: 'No data found for this route.' });
  }

  return res.json(summary);
});

/**
 * DELETE /routewatch/status-codes
 * Clears all status code logs.
 */
statusCodesRouter.delete('/', (_req, res) => {
  clearStatusCodeLogs();
  res.json({ message: 'Status code logs cleared.' });
});
