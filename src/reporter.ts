import { getStats, RouteStats } from './tracker';

export interface ReportEntry {
  method: string;
  path: string;
  hits: number;
  lastHit: Date | null;
  avgResponseTime: number | null;
}

export interface Report {
  generatedAt: Date;
  totalRequests: number;
  routes: ReportEntry[];
}

/**
 * Generates a structured report from the current route stats.
 * Routes are sorted by hit count descending.
 */
export function generateReport(): Report {
  const stats = getStats();
  const routes: ReportEntry[] = [];

  for (const [key, stat] of Object.entries(stats)) {
    const [method, path] = key.split(' ');
    const avgResponseTime =
      stat.responseTimes && stat.responseTimes.length > 0
        ? stat.responseTimes.reduce((a: number, b: number) => a + b, 0) /
          stat.responseTimes.length
        : null;

    routes.push({
      method,
      path,
      hits: stat.hits,
      lastHit: stat.lastHit ? new Date(stat.lastHit) : null,
      avgResponseTime,
    });
  }

  routes.sort((a, b) => b.hits - a.hits);

  const totalRequests = routes.reduce((sum, r) => sum + r.hits, 0);

  return {
    generatedAt: new Date(),
    totalRequests,
    routes,
  };
}

/**
 * Formats a report as a human-readable ASCII table string.
 */
export function formatReportAsTable(report: Report): string {
  const lines: string[] = [];
  const header = `RouteWatch Report — ${report.generatedAt.toISOString()}`;
  const divider = '─'.repeat(72);

  lines.push(divider);
  lines.push(header);
  lines.push(`Total Requests: ${report.totalRequests}`);
  lines.push(divider);
  lines.push(
    `${'METHOD'.padEnd(8)} ${'PATH'.padEnd(35)} ${'HITS'.padEnd(6)} ${'AVG (ms)'.padEnd(10)} LAST HIT`
  );
  lines.push(divider);

  for (const entry of report.routes) {
    const avg =
      entry.avgResponseTime !== null
        ? entry.avgResponseTime.toFixed(1)
        : 'N/A';
    const last = entry.lastHit ? entry.lastHit.toISOString() : 'N/A';
    lines.push(
      `${entry.method.padEnd(8)} ${entry.path.padEnd(35)} ${String(entry.hits).padEnd(6)} ${avg.padEnd(10)} ${last}`
    );
  }

  lines.push(divider);
  return lines.join('\n');
}
