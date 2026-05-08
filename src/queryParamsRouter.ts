import { Router } from 'express';
import {
  getQueryParamStats,
  getAllQueryParamStats,
  getQueryParamLog,
  clearQueryParamLog,
} from './queryParams';

const router = Router();

router.get('/query-params', (_req, res) => {
  res.json(getAllQueryParamStats());
});

router.get('/query-params/:method/:route(*)', (req, res) => {
  const { method, route } = req.params;
  const stats = getQueryParamStats(method, `/${route}`);
  if (!stats) {
    return res.status(404).json({ error: 'No data found for that route' });
  }
  res.json(stats);
});

router.get('/query-params/log', (_req, res) => {
  res.json(getQueryParamLog());
});

router.delete('/query-params', (_req, res) => {
  clearQueryParamLog();
  res.json({ message: 'Query param log cleared' });
});

export default router;
