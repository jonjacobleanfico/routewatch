import { Request, Response, NextFunction } from "express";

export interface ErrorEntry {
  method: string;
  path: string;
  statusCode: number;
  message: string;
  timestamp: number;
}

const errorLog: ErrorEntry[] = [];

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function recordError(entry: ErrorEntry): void {
  errorLog.push(entry);
}

export function getErrorLog(): ErrorEntry[] {
  return [...errorLog];
}

export function getErrorsByRoute(
  method: string,
  path: string
): ErrorEntry[] {
  const key = routeKey(method, path);
  return errorLog.filter(
    (e) => routeKey(e.method, e.path) === key
  );
}

export function getErrorSummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const entry of errorLog) {
    const key = routeKey(entry.method, entry.path);
    summary[key] = (summary[key] ?? 0) + 1;
  }
  return summary;
}

/**
 * Returns all error entries whose status code matches the given value.
 */
export function getErrorsByStatusCode(statusCode: number): ErrorEntry[] {
  return errorLog.filter((e) => e.statusCode === statusCode);
}

/**
 * Returns all error entries that occurred within the given time range.
 * @param from - Start of the range (Unix timestamp in ms, inclusive)
 * @param to - End of the range (Unix timestamp in ms, inclusive). Defaults to now.
 */
export function getErrorsByTimeRange(
  from: number,
  to: number = Date.now()
): ErrorEntry[] {
  return errorLog.filter((e) => e.timestamp >= from && e.timestamp <= to);
}

export function clearErrorLog(): void {
  errorLog.length = 0;
}

export function errorTrackerMiddleware(
  err: Error & { status?: number; statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.status ?? err.statusCode ?? 500;
  recordError({
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message ?? "Unknown error",
    timestamp: Date.now(),
  });
  next(err);
}
