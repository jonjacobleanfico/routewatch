// Tracks custom request headers observed per route

type HeaderMap = Record<string, Record<string, number>>;
// routeKey -> headerName -> count

const headerLog: Record<string, HeaderMap> = {};

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function recordCustomHeaders(
  method: string,
  path: string,
  headers: Record<string, string | string[] | undefined>,
  watchedHeaders: string[]
): void {
  const key = routeKey(method, path);
  if (!headerLog[key]) headerLog[key] = {};

  for (const name of watchedHeaders) {
    const normalized = name.toLowerCase();
    const value = headers[normalized];
    if (value === undefined) continue;
    const strVal = Array.isArray(value) ? value.join(",") : value;
    if (!headerLog[key][normalized]) headerLog[key][normalized] = {};
    headerLog[key][normalized][strVal] = (headerLog[key][normalized][strVal] ?? 0) + 1;
  }
}

export function getHeaderStats(method: string, path: string): HeaderMap {
  return headerLog[routeKey(method, path)] ?? {};
}

export function getAllHeaderStats(): Record<string, HeaderMap> {
  return { ...headerLog };
}

export function getTopHeaderValues(
  method: string,
  path: string,
  headerName: string,
  limit = 5
): Array<{ value: string; count: number }> {
  const key = routeKey(method, path);
  const normalized = headerName.toLowerCase();
  const values = headerLog[key]?.[normalized] ?? {};
  return Object.entries(values)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function clearHeaderLog(): void {
  for (const key of Object.keys(headerLog)) {
    delete headerLog[key];
  }
}
