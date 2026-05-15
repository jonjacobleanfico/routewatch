export interface TimeoutRule {
  method: string;
  path: string;
  timeoutMs: number;
  action: 'log' | 'abort';
}

export interface TimeoutViolation {
  method: string;
  path: string;
  durationMs: number;
  timeoutMs: number;
  timestamp: number;
}

const timeoutRules = new Map<string, TimeoutRule>();
const violations: TimeoutViolation[] = [];

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setTimeoutRule(method: string, path: string, timeoutMs: number, action: 'log' | 'abort' = 'log'): void {
  const key = routeKey(method, path);
  timeoutRules.set(key, { method: method.toUpperCase(), path, timeoutMs, action });
}

export function removeTimeoutRule(method: string, path: string): boolean {
  return timeoutRules.delete(routeKey(method, path));
}

export function getTimeoutRule(method: string, path: string): TimeoutRule | undefined {
  return timeoutRules.get(routeKey(method, path));
}

export function getAllTimeoutRules(): TimeoutRule[] {
  return Array.from(timeoutRules.values());
}

export function recordTimeoutViolation(method: string, path: string, durationMs: number, timeoutMs: number): void {
  violations.push({
    method: method.toUpperCase(),
    path,
    durationMs,
    timeoutMs,
    timestamp: Date.now(),
  });
}

export function getTimeoutViolations(): TimeoutViolation[] {
  return [...violations];
}

export function getViolationsByRoute(method: string, path: string): TimeoutViolation[] {
  const key = routeKey(method, path);
  return violations.filter(v => routeKey(v.method, v.path) === key);
}

export function clearTimeoutData(): void {
  timeoutRules.clear();
  violations.length = 0;
}
