import { RouteStats } from './tracker';

export interface RateLimitRule {
  route: string;
  method: string;
  maxHitsPerMinute: number;
}

export interface RateLimitResult {
  route: string;
  method: string;
  hitsPerMinute: number;
  limit: number;
  exceeded: boolean;
}

const rules: RateLimitRule[] = [];

export function addRateLimitRule(rule: RateLimitRule): void {
  const existing = rules.findIndex(
    (r) => r.route === rule.route && r.method === rule.method
  );
  if (existing >= 0) {
    rules[existing] = rule;
  } else {
    rules.push(rule);
  }
}

export function clearRateLimitRules(): void {
  rules.length = 0;
}

export function getRateLimitRules(): RateLimitRule[] {
  return [...rules];
}

export function evaluateRateLimits(
  statsMap: Map<string, RouteStats>
): RateLimitResult[] {
  const results: RateLimitResult[] = [];

  for (const rule of rules) {
    const key = `${rule.method.toUpperCase()}:${rule.route}`;
    const stats = statsMap.get(key);

    if (!stats) continue;

    const now = Date.now();
    const oneMinuteAgo = now - 60_000;
    const recentHits = stats.hits.filter(
      (h) => new Date(h.timestamp).getTime() >= oneMinuteAgo
    ).length;

    results.push({
      route: rule.route,
      method: rule.method.toUpperCase(),
      hitsPerMinute: recentHits,
      limit: rule.maxHitsPerMinute,
      exceeded: recentHits > rule.maxHitsPerMinute,
    });
  }

  return results;
}
