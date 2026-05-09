// Tracks retry attempts per route based on repeated requests from the same IP within a short window

export interface RetryEntry {
  method: string;
  path: string;
  ip: string;
  timestamp: number;
  count: number;
}

export interface RetryStats {
  totalRetries: number;
  uniqueIps: number;
  maxRetries: number;
  entries: RetryEntry[];
}

const retryLog = new Map<string, RetryEntry[]>();
const RETRY_WINDOW_MS = 5000;

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function recordRetry(method: string, path: string, ip: string): void {
  const key = routeKey(method, path);
  const now = Date.now();
  const entries = retryLog.get(key) ?? [];

  const existing = entries.find(
    (e) => e.ip === ip && now - e.timestamp < RETRY_WINDOW_MS
  );

  if (existing) {
    existing.count += 1;
    existing.timestamp = now;
  } else {
    entries.push({ method, path, ip, timestamp: now, count: 1 });
  }

  retryLog.set(key, entries);
}

export function getRetryStats(method: string, path: string): RetryStats {
  const key = routeKey(method, path);
  const entries = retryLog.get(key) ?? [];
  const retries = entries.filter((e) => e.count > 1);
  const uniqueIps = new Set(retries.map((e) => e.ip)).size;
  const maxRetries = retries.reduce((max, e) => Math.max(max, e.count), 0);
  return {
    totalRetries: retries.reduce((sum, e) => sum + e.count, 0),
    uniqueIps,
    maxRetries,
    entries: retries,
  };
}

export function getAllRetryStats(): Record<string, RetryStats> {
  const result: Record<string, RetryStats> = {};
  for (const key of retryLog.keys()) {
    const [method, ...rest] = key.split(':');
    const path = rest.join(':');
    result[key] = getRetryStats(method, path);
  }
  return result;
}

export function clearRetryLog(): void {
  retryLog.clear();
}
