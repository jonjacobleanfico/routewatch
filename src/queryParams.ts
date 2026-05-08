export interface QueryParamEntry {
  route: string;
  method: string;
  params: Record<string, string>;
  timestamp: number;
}

export interface QueryParamStats {
  route: string;
  method: string;
  totalHits: number;
  paramKeys: Record<string, number>;
  paramValues: Record<string, Record<string, number>>;
}

const log: QueryParamEntry[] = [];

export function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()}:${route}`;
}

export function recordQueryParams(
  method: string,
  route: string,
  params: Record<string, string>
): void {
  log.push({ route, method: method.toUpperCase(), params, timestamp: Date.now() });
}

export function getQueryParamStats(method: string, route: string): QueryParamStats | null {
  const key = routeKey(method, route);
  const entries = log.filter(e => routeKey(e.method, e.route) === key);
  if (entries.length === 0) return null;
  return aggregateStats(method.toUpperCase(), route, entries);
}

export function getAllQueryParamStats(): QueryParamStats[] {
  const keys = [...new Set(log.map(e => routeKey(e.method, e.route)))];
  return keys.map(key => {
    const [method, route] = key.split(/:(.+)/);
    const entries = log.filter(e => routeKey(e.method, e.route) === key);
    return aggregateStats(method, route, entries);
  });
}

function aggregateStats(method: string, route: string, entries: QueryParamEntry[]): QueryParamStats {
  const paramKeys: Record<string, number> = {};
  const paramValues: Record<string, Record<string, number>> = {};

  for (const entry of entries) {
    for (const [key, value] of Object.entries(entry.params)) {
      paramKeys[key] = (paramKeys[key] ?? 0) + 1;
      if (!paramValues[key]) paramValues[key] = {};
      paramValues[key][value] = (paramValues[key][value] ?? 0) + 1;
    }
  }

  return { route, method, totalHits: entries.length, paramKeys, paramValues };
}

export function getQueryParamLog(): QueryParamEntry[] {
  return [...log];
}

export function clearQueryParamLog(): void {
  log.length = 0;
}
