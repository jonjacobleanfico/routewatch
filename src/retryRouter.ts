import { Router } from 'express';
import { getRetryStats, getAllRetryStats, clearRetryLog } from './retryTracker';

const router = Router();

// GET /retries — all retry stats
router.get('/', (_req, res) => {
  res.json(getAllRetryStats());
});

// GET /retries/:method/:path — stats for a specific route
router.get('/:method/*', (req, res) => {
  const method = req.params.method.toUpperCase();
  const path = '/' + (req.params as Record<string, string>)['0'];
  const stats = getRetryStats(method, path);
  res.json(stats);
});

// DELETE /retries — clear all retry logs
router.delete('/', (_req, res) => {
  clearRetryLog();
  res.json({ message: 'Retry log cleared.' });
});

export { router as retryRouter };
