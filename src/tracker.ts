export interface RouteHit {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: Date;
}

export interface RouteStats {
  method: string;
  path: string;
  hitCount: number;
  avgDurationMs?: number;
  lastHitAt?: Date;
}

const hitMap = new Map<string, RouteHit[]>();

export function recordHit(hit: RouteHit): void {
  const key = `${hit.method}:${hit.path}`;
  const existing = hitMap.get(key) ?? [];
  existing.push(hit);
  hitMap.set(key, existing);
}

export function getStats(): RouteStats[] {
  const stats: RouteStats[] = [];

  for (const [key, hits] of hitMap.entries()) {
    const [method, ...pathParts] = key.split(':');
    const path = pathParts.join(':');
    const hitCount = hits.length;
    const avgDurationMs =
      hits.reduce((sum, h) => sum + h.durationMs, 0) / hitCount;
    const lastHitAt = hits.reduce<Date | undefined>((latest, h) => {
      return !latest || h.timestamp > latest ? h.timestamp : latest;
    }, undefined);

    stats.push({ method, path, hitCount, avgDurationMs, lastHitAt });
  }

  return stats.sort((a, b) => b.hitCount - a.hitCount);
}

export function resetStats(): void {
  hitMap.clear();
}
