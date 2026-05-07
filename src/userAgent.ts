import { Request } from 'express';

export interface UserAgentEntry {
  userAgent: string;
  count: number;
  lastSeen: string;
}

const uaLog: Map<string, UserAgentEntry> = new Map();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function extractUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

export function recordUserAgent(method: string, path: string, req: Request): void {
  const ua = extractUserAgent(req);
  const key = `${routeKey(method, path)}::${ua}`;
  const existing = uaLog.get(key);
  if (existing) {
    existing.count += 1;
    existing.lastSeen = new Date().toISOString();
  } else {
    uaLog.set(key, {
      userAgent: ua,
      count: 1,
      lastSeen: new Date().toISOString(),
    });
  }
}

export function getUserAgentStats(method: string, path: string): UserAgentEntry[] {
  const prefix = `${routeKey(method, path)}::`;
  const results: UserAgentEntry[] = [];
  for (const [key, entry] of uaLog.entries()) {
    if (key.startsWith(prefix)) {
      results.push({ ...entry });
    }
  }
  return results.sort((a, b) => b.count - a.count);
}

export function getAllUserAgentStats(): Record<string, UserAgentEntry[]> {
  const result: Record<string, UserAgentEntry[]> = {};
  for (const [key, entry] of uaLog.entries()) {
    const routePart = key.substring(0, key.lastIndexOf('::'));
    if (!result[routePart]) result[routePart] = [];
    result[routePart].push({ ...entry });
  }
  for (const route of Object.keys(result)) {
    result[route].sort((a, b) => b.count - a.count);
  }
  return result;
}

export function getTopUserAgents(limit = 5): UserAgentEntry[] {
  const totals: Map<string, UserAgentEntry> = new Map();
  for (const entry of uaLog.values()) {
    const existing = totals.get(entry.userAgent);
    if (existing) {
      existing.count += entry.count;
      if (entry.lastSeen > existing.lastSeen) existing.lastSeen = entry.lastSeen;
    } else {
      totals.set(entry.userAgent, { ...entry });
    }
  }
  return Array.from(totals.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function clearUserAgentLog(): void {
  uaLog.clear();
}
