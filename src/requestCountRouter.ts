import { Router } from 'express';
import {
  getAllRequestCounts,
  getRequestCountInWindow,
  getTopRequestedRoutes,
  clearRequestCountLog,
  TimeWindow,
} from './requestCount';

const VALID_WINDOWS: TimeWindow[] = ['1m', '5m', '15m', '1h'];

function isValidWindow(w: string): w is TimeWindow {
  return VALID_WINDOWS.includes(w as TimeWindow);
}

export const requestCountRouter = Router();

requestCountRouter.get('/request-counts', (req, res) => {
  const window = (req.query.window as string) ?? '5m';
  if (!isValidWindow(window)) {
    return res.status(400).json({ error: `Invalid window. Use one of: ${VALID_WINDOWS.join(', ')}` });
  }
  const counts = getAllRequestCounts(window);
  res.json({ window, counts });
});

requestCountRouter.get('/request-counts/top', (req, res) => {
  const window = (req.query.window as string) ?? '5m';
  const limit = parseInt((req.query.limit as string) ?? '10', 10);
  if (!isValidWindow(window)) {
    return res.status(400).json({ error: `Invalid window. Use one of: ${VALID_WINDOWS.join(', ')}` });
  }
  const top = getTopRequestedRoutes(window, isNaN(limit) ? 10 : limit);
  res.json({ window, limit, routes: top });
});

requestCountRouter.get('/request-counts/:method/:path(*)', (req, res) => {
  const window = (req.query.window as string) ?? '5m';
  if (!isValidWindow(window)) {
    return res.status(400).json({ error: `Invalid window. Use one of: ${VALID_WINDOWS.join(', ')}` });
  }
  const { method, path } = req.params;
  const count = getRequestCountInWindow(method, `/${path}`, window);
  res.json({ route: `${method.toUpperCase()} /${path}`, window, count });
});

requestCountRouter.delete('/request-counts', (_req, res) => {
  clearRequestCountLog();
  res.json({ success: true });
});
