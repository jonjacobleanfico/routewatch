import { Router } from 'express';
import { getResponseTimeStats, getAllResponseTimeStats } from './responseTime';
import { getErrorsByRoute, getErrorSummary } from './errorTracker';
import { getStats } from './tracker';
import { computeRouteHealth, summarizeHealth, RouteHealthScore } from './routeHealth';

export const routeHealthRouter = Router();

routeHealthRouter.get('/health', (_req, res) => {
  const stats = getStats();
  const allResponseTimes = getAllResponseTimeStats();
  const errorSummary = getErrorSummary();
  const scores: RouteHealthScore[] = [];

  for (const [key, stat] of Object.entries(stats)) {
    const [method, route] = key.split(' ');
    const rtStats = allResponseTimes[key];
    const errCount = errorSummary[key]?.count ?? 0;

    const avgMs = rtStats?.avg ?? 0;
    const p95Ms = rtStats?.p95 ?? 0;

    const score = computeRouteHealth(route, method, {
      totalHits: stat.hits,
      errorCount: errCount,
      avgResponseTimeMs: avgMs,
      p95ResponseTimeMs: p95Ms,
    });

    scores.push(score);
  }

  const summary = summarizeHealth(scores);
  res.json(summary);
});

routeHealthRouter.get('/health/:method/:route(*)', (req, res) => {
  const { method, route } = req.params;
  const key = `${method.toUpperCase()} /${route}`;
  const stats = getStats();
  const stat = stats[key];

  if (!stat) {
    res.status(404).json({ error: 'Route not found' });
    return;
  }

  const rtStats = getResponseTimeStats(method.toUpperCase(), `/${route}`);
  const errors = getErrorsByRoute(method.toUpperCase(), `/${route}`);
  const errCount = errors.length;

  const score = computeRouteHealth(`/${route}`, method.toUpperCase(), {
    totalHits: stat.hits,
    errorCount: errCount,
    avgResponseTimeMs: rtStats?.avg ?? 0,
    p95ResponseTimeMs: rtStats?.p95 ?? 0,
  });

  res.json(score);
});
