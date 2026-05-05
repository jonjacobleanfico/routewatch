import { getStats, RouteStats } from './tracker';
import { generateReport, formatReportAsTable } from './reporter';
import { Request, Response, Router } from 'express';

export interface DashboardOptions {
  path?: string;
  format?: 'json' | 'table' | 'html';
}

const defaultOptions: DashboardOptions = {
  path: '/__routewatch',
  format: 'html',
};

function renderHtmlDashboard(stats: RouteStats[]): string {
  const report = generateReport(stats);
  const table = formatReportAsTable(stats);
  const timestamp = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>RouteWatch Dashboard</title>
  <style>
    body { font-family: monospace; padding: 2rem; background: #111; color: #eee; }
    h1 { color: #7ee8a2; }
    pre { background: #1e1e1e; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    .meta { color: #888; font-size: 0.85rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h1>RouteWatch Dashboard</h1>
  <p class="meta">Generated: ${timestamp} &mdash; Total routes tracked: ${report.totalRoutes} &mdash; Total hits: ${report.totalHits}</p>
  <pre>${table}</pre>
</body>
</html>`;
}

export function dashboardRouter(options: DashboardOptions = {}): Router {
  const opts = { ...defaultOptions, ...options };
  const router = Router();

  router.get(opts.path!, (req: Request, res: Response) => {
    const stats = getStats();

    if (opts.format === 'json') {
      return res.json(generateReport(stats));
    }

    if (opts.format === 'table') {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(formatReportAsTable(stats));
    }

    res.setHeader('Content-Type', 'text/html');
    return res.send(renderHtmlDashboard(stats));
  });

  return router;
}
