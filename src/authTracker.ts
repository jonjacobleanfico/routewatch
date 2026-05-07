// Tracks authentication outcomes (success/failure) per route

export interface AuthEvent {
  method: string;
  path: string;
  outcome: 'success' | 'failure';
  reason?: string;
  timestamp: number;
}

export interface AuthStats {
  successes: number;
  failures: number;
  failureReasons: Record<string, number>;
  lastFailureAt?: number;
  lastSuccessAt?: number;
}

const authLog: AuthEvent[] = [];
const authStatsMap: Map<string, AuthStats> = new Map();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function recordAuthEvent(event: AuthEvent): void {
  authLog.push(event);
  const key = routeKey(event.method, event.path);
  const existing = authStatsMap.get(key) ?? {
    successes: 0,
    failures: 0,
    failureReasons: {},
  };

  if (event.outcome === 'success') {
    existing.successes += 1;
    existing.lastSuccessAt = event.timestamp;
  } else {
    existing.failures += 1;
    existing.lastFailureAt = event.timestamp;
    if (event.reason) {
      existing.failureReasons[event.reason] =
        (existing.failureReasons[event.reason] ?? 0) + 1;
    }
  }

  authStatsMap.set(key, existing);
}

export function getAuthStats(method: string, path: string): AuthStats | undefined {
  return authStatsMap.get(routeKey(method, path));
}

export function getAllAuthStats(): Record<string, AuthStats> {
  return Object.fromEntries(authStatsMap.entries());
}

export function getAuthLog(): AuthEvent[] {
  return [...authLog];
}

export function getFailureRate(method: string, path: string): number | null {
  const stats = getAuthStats(method, path);
  if (!stats) return null;
  const total = stats.successes + stats.failures;
  return total === 0 ? 0 : stats.failures / total;
}

export function clearAuthLog(): void {
  authLog.length = 0;
  authStatsMap.clear();
}
