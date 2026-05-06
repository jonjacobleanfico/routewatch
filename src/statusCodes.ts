/**
 * Tracks HTTP response status code distribution per route.
 */

type StatusCodeMap = Record<number, number>;
type RouteStatusMap = Record<string, StatusCodeMap>;

const statusCodeLog: RouteStatusMap = {};

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function recordStatusCode(method: string, path: string, statusCode: number): void {
  const key = routeKey(method, path);
  if (!statusCodeLog[key]) {
    statusCodeLog[key] = {};
  }
  const current = statusCodeLog[key][statusCode] ?? 0;
  statusCodeLog[key][statusCode] = current + 1;
}

export function getStatusCodeStats(method: string, path: string): StatusCodeMap {
  const key = routeKey(method, path);
  return statusCodeLog[key] ?? {};
}

export function getAllStatusCodeStats(): RouteStatusMap {
  return { ...statusCodeLog };
}

export function getStatusCodeSummary(method: string, path: string): {
  total: number;
  successRate: number;
  errorRate: number;
  breakdown: StatusCodeMap;
} {
  const stats = getStatusCodeStats(method, path);
  const entries = Object.entries(stats);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const successCount = entries
    .filter(([code]) => parseInt(code) >= 200 && parseInt(code) < 300)
    .reduce((sum, [, count]) => sum + count, 0);
  const errorCount = entries
    .filter(([code]) => parseInt(code) >= 400)
    .reduce((sum, [, count]) => sum + count, 0);

  return {
    total,
    successRate: total > 0 ? successCount / total : 0,
    errorRate: total > 0 ? errorCount / total : 0,
    breakdown: stats,
  };
}

export function clearStatusCodeLogs(): void {
  for (const key of Object.keys(statusCodeLog)) {
    delete statusCodeLog[key];
  }
}
