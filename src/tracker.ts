export interface RouteHit {
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  timestamp: Date;
}

export interface RouteStats {
  method: string;
  path: string;
  hitCount: number;
  avgResponseTimeMs: number;
  lastHit: Date;
  statusCodes: Record<number, number>;
}

const routeHits: RouteHit[] = [];

export function recordHit(hit: RouteHit): void {
  routeHits.push(hit);
}

export function getStats(): RouteStats[] {
  const statsMap = new Map<string, RouteStats>();

  for (const hit of routeHits) {
    const key = `${hit.method}:${hit.path}`;

    if (!statsMap.has(key)) {
      statsMap.set(key, {
        method: hit.method,
        path: hit.path,
        hitCount: 0,
        avgResponseTimeMs: 0,
        lastHit: hit.timestamp,
        statusCodes: {},
      });
    }

    const stats = statsMap.get(key)!;
    const prevTotal = stats.avgResponseTimeMs * stats.hitCount;
    stats.hitCount += 1;
    stats.avgResponseTimeMs = (prevTotal + hit.responseTimeMs) / stats.hitCount;
    stats.lastHit = hit.timestamp > stats.lastHit ? hit.timestamp : stats.lastHit;
    stats.statusCodes[hit.statusCode] = (stats.statusCodes[hit.statusCode] ?? 0) + 1;
  }

  return Array.from(statsMap.values());
}

export function resetStats(): void {
  routeHits.length = 0;
}
