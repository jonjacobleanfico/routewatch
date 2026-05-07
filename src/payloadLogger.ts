/**
 * payloadLogger.ts
 * Records request/response payload metadata for routes in development.
 */

export interface PayloadEntry {
  method: string;
  route: string;
  requestContentType: string | undefined;
  requestBodySize: number;
  responseContentType: string | undefined;
  responseBodySize: number;
  timestamp: number;
}

const payloadLog: PayloadEntry[] = [];

export function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()} ${route}`;
}

export function recordPayload(entry: PayloadEntry): void {
  payloadLog.push(entry);
}

export function getPayloadLog(): PayloadEntry[] {
  return [...payloadLog];
}

export function getPayloadsByRoute(method: string, route: string): PayloadEntry[] {
  const key = routeKey(method, route);
  return payloadLog.filter(
    (e) => routeKey(e.method, e.route) === key
  );
}

export function getPayloadSummary(): Record<string, { count: number; avgRequestSize: number; avgResponseSize: number }> {
  const summary: Record<string, { count: number; totalReq: number; totalRes: number }> = {};

  for (const entry of payloadLog) {
    const key = routeKey(entry.method, entry.route);
    if (!summary[key]) {
      summary[key] = { count: 0, totalReq: 0, totalRes: 0 };
    }
    summary[key].count++;
    summary[key].totalReq += entry.requestBodySize;
    summary[key].totalRes += entry.responseBodySize;
  }

  const result: Record<string, { count: number; avgRequestSize: number; avgResponseSize: number }> = {};
  for (const [key, val] of Object.entries(summary)) {
    result[key] = {
      count: val.count,
      avgRequestSize: val.count > 0 ? Math.round(val.totalReq / val.count) : 0,
      avgResponseSize: val.count > 0 ? Math.round(val.totalRes / val.count) : 0,
    };
  }
  return result;
}

export function clearPayloadLog(): void {
  payloadLog.length = 0;
}
