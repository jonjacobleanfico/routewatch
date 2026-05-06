import { Request } from 'express';

export interface RequestSizeEntry {
  route: string;
  method: string;
  totalBytes: number;
  count: number;
  avgBytes: number;
  maxBytes: number;
  minBytes: number;
}

const sizeLogs = new Map<string, { totalBytes: number; count: number; maxBytes: number; minBytes: number }>();

export function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()}:${route}`;
}

export function recordRequestSize(method: string, route: string, bytes: number): void {
  const key = routeKey(method, route);
  const existing = sizeLogs.get(key);
  if (existing) {
    existing.totalBytes += bytes;
    existing.count += 1;
    existing.maxBytes = Math.max(existing.maxBytes, bytes);
    existing.minBytes = Math.min(existing.minBytes, bytes);
  } else {
    sizeLogs.set(key, { totalBytes: bytes, count: 1, maxBytes: bytes, minBytes: bytes });
  }
}

export function getRequestSizeStats(method: string, route: string): RequestSizeEntry | null {
  const key = routeKey(method, route);
  const entry = sizeLogs.get(key);
  if (!entry) return null;
  return {
    route,
    method: method.toUpperCase(),
    totalBytes: entry.totalBytes,
    count: entry.count,
    avgBytes: Math.round(entry.totalBytes / entry.count),
    maxBytes: entry.maxBytes,
    minBytes: entry.minBytes,
  };
}

export function getAllRequestSizeStats(): RequestSizeEntry[] {
  return Array.from(sizeLogs.entries()).map(([key, entry]) => {
    const [method, route] = key.split(/:(.+)/);
    return {
      route,
      method,
      totalBytes: entry.totalBytes,
      count: entry.count,
      avgBytes: Math.round(entry.totalBytes / entry.count),
      maxBytes: entry.maxBytes,
      minBytes: entry.minBytes,
    };
  });
}

export function extractRequestBytes(req: Request): number {
  const contentLength = req.headers['content-length'];
  if (contentLength) return parseInt(contentLength, 10);
  if (req.body) {
    try {
      return Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    } catch {
      return 0;
    }
  }
  return 0;
}

export function clearRequestSizeLogs(): void {
  sizeLogs.clear();
}
