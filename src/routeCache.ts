export interface CacheRule {
  ttl: number; // seconds
  maxSize?: number;
}

export interface CacheEntry {
  route: string;
  method: string;
  hits: number;
  misses: number;
  evictions: number;
  rule: CacheRule;
}

function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

const cacheRules = new Map<string, CacheRule>();
const cacheStats = new Map<string, Omit<CacheEntry, 'route' | 'method' | 'rule'>>();

export function setCacheRule(method: string, path: string, rule: CacheRule): void {
  const key = routeKey(method, path);
  cacheRules.set(key, rule);
  if (!cacheStats.has(key)) {
    cacheStats.set(key, { hits: 0, misses: 0, evictions: 0 });
  }
}

export function removeCacheRule(method: string, path: string): boolean {
  const key = routeKey(method, path);
  cacheStats.delete(key);
  return cacheRules.delete(key);
}

export function getCacheRule(method: string, path: string): CacheRule | undefined {
  return cacheRules.get(routeKey(method, path));
}

export function recordCacheHit(method: string, path: string, hit: boolean): void {
  const key = routeKey(method, path);
  const stats = cacheStats.get(key) ?? { hits: 0, misses: 0, evictions: 0 };
  if (hit) stats.hits++;
  else stats.misses++;
  cacheStats.set(key, stats);
}

export function recordCacheEviction(method: string, path: string): void {
  const key = routeKey(method, path);
  const stats = cacheStats.get(key) ?? { hits: 0, misses: 0, evictions: 0 };
  stats.evictions++;
  cacheStats.set(key, stats);
}

export function getCacheStats(method: string, path: string): CacheEntry | undefined {
  const key = routeKey(method, path);
  const rule = cacheRules.get(key);
  const stats = cacheStats.get(key);
  if (!rule || !stats) return undefined;
  return { route: path, method: method.toUpperCase(), ...stats, rule };
}

export function getAllCacheStats(): CacheEntry[] {
  return Array.from(cacheRules.entries()).map(([key, rule]) => {
    const [method, ...pathParts] = key.split(':');
    const path = pathParts.join(':');
    const stats = cacheStats.get(key) ?? { hits: 0, misses: 0, evictions: 0 };
    return { route: path, method, ...stats, rule };
  });
}

export function clearCacheStats(): void {
  cacheStats.clear();
  cacheRules.clear();
}
