import { RouteHit } from './tracker';

interface ResponseTimeStats {
  route: string;
  method: string;
  avg: number;
  min: number;
  max: number;
  p95: number;
  count: number;
}

const responseTimeLogs: Map<string, number[]> = new Map();

export function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()}:${route}`;
}

export function recordResponseTime(method: string, route: string, durationMs: number): void {
  const key = routeKey(method, route);
  if (!responseTimeLogs.has(key)) {
    responseTimeLogs.set(key, []);
  }
  responseTimeLogs.get(key)!.push(durationMs);
}

export function getResponseTimeStats(method: string, route: string): ResponseTimeStats | null {
  const key = routeKey(method, route);
  const times = responseTimeLogs.get(key);
  if (!times || times.length === 0) return null;

  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const p95Index = Math.floor(sorted.length * 0.95);

  return {
    route,
    method: method.toUpperCase(),
    avg: Math.round(sum / sorted.length),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: sorted[p95Index] ?? sorted[sorted.length - 1],
    count: sorted.length,
  };
}

export function getAllResponseTimeStats(): ResponseTimeStats[] {
  const results: ResponseTimeStats[] = [];
  for (const key of responseTimeLogs.keys()) {
    const [method, ...routeParts] = key.split(':');
    const route = routeParts.join(':');
    const stats = getResponseTimeStats(method, route);
    if (stats) results.push(stats);
  }
  return results.sort((a, b) => b.avg - a.avg);
}

export function clearResponseTimeLogs(): void {
  responseTimeLogs.clear();
}
