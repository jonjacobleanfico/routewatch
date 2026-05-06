import { Router } from 'express';
import { getAllResponseTimeStats, getResponseTimeStats, clearResponseTimeLogs } from './responseTime';

const responseTimeRouter = Router();

responseTimeRouter.get('/', (_req, res) => {
  const stats = getAllResponseTimeStats();
  res.json({ stats });
});

responseTimeRouter.get('/:method/:route(*)', (req, res) => {
  const { method, route } = req.params;
  const stats = getResponseTimeStats(method, route);
  if (!stats) {
    return res.status(404).json({ error: 'No data found for the specified route and method.' });
  }
  res.json(stats);
});

responseTimeRouter.delete('/', (_req, res) => {
  clearResponseTimeLogs();
  res.json({ message: 'Response time logs cleared.' });
});

export { responseTimeRouter };
