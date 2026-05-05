import { RouteStats } from './tracker';

export type ExportFormat = 'json' | 'csv';

export function exportStats(stats: RouteStats[], format: ExportFormat): string {
  if (format === 'csv') {
    return exportAsCsv(stats);
  }
  return exportAsJson(stats);
}

function exportAsJson(stats: RouteStats[]): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    totalRoutes: stats.length,
    totalHits: stats.reduce((sum, s) => sum + s.hitCount, 0),
    routes: stats,
  };
  return JSON.stringify(payload, null, 2);
}

function exportAsCsv(stats: RouteStats[]): string {
  const headers = ['method', 'path', 'hitCount', 'avgDurationMs', 'lastHitAt'];
  const rows = stats.map((s) => [
    s.method,
    s.path,
    String(s.hitCount),
    s.avgDurationMs !== undefined ? s.avgDurationMs.toFixed(2) : '',
    s.lastHitAt ? s.lastHitAt.toISOString() : '',
  ]);

  const lines = [headers.join(','), ...rows.map((r) => r.join(','))];
  return lines.join('\n');
}

export function exporterRouter(
  getStats: () => RouteStats[]
): import('express').Router {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Router } = require('express');
  const router = Router();

  router.get('/routewatch/export', (req: any, res: any) => {
    const format: ExportFormat =
      req.query.format === 'csv' ? 'csv' : 'json';
    const stats = getStats();
    const content = exportStats(stats, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="routewatch.csv"'
      );
    } else {
      res.setHeader('Content-Type', 'application/json');
    }

    res.send(content);
  });

  return router;
}
