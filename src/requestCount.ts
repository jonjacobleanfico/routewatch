// Tracks per-route request counts over configurable time windows

export type TimeWindow = '1m' | '5m' | '15m' | '1h';

const WINDOW_MS: Record<TimeWindow, number> = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
};

interface TimestampedHit {
  ts: number;
}

const hitLog = new Map<string, TimestampedHit[]>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function recordRequestCountHit(method: string, path: string): void {
  const key = routeKey(method, path);
  const hits = hitLog.get(key) ?? [];
  hits.push({ ts: Date.now() });
  hitLog.set(key, hits);
}

export function getRequestCountInWindow(
  method: string,
  path: string,
  window: TimeWindow
): number {
  const key = routeKey(method, path);
  const hits = hitLog.get(key) ?? [];
  const cutoff = Date.now() - WINDOW_MS[window];
  return hits.filter((h) => h.ts >= cutoff).length;
}

export function getAllRequestCounts(
  window: TimeWindow
): Record<string, number> {
  const cutoff = Date.now() - WINDOW_MS[window];
  const result: Record<string, number> = {};
  for (const [key, hits] of hitLog.entries()) {
    result[key] = hits.filter((h) => h.ts >= cutoff).length;
  }
  return result;
}

export function getTopRequestedRoutes(
  window: TimeWindow,
  limit = 10
): Array<{ route: string; count: number }> {
  const counts = getAllRequestCounts(window);
  return Object.entries(counts)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function clearRequestCountLog(): void {
  hitLog.clear();
}
