/**
 * Tracks deprecated route usage — routes that are marked as deprecated
 * and records how often they are still being called.
 */

type DeprecationEntry = {
  route: string;
  method: string;
  deprecatedSince?: string;
  message?: string;
  hitCount: number;
  lastHitAt?: Date;
};

const deprecatedRoutes = new Map<string, DeprecationEntry>();

function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()}:${route}`;
}

export function markDeprecated(
  method: string,
  route: string,
  options: { deprecatedSince?: string; message?: string } = {}
): void {
  const key = routeKey(method, route);
  const existing = deprecatedRoutes.get(key);
  deprecatedRoutes.set(key, {
    route,
    method: method.toUpperCase(),
    deprecatedSince: options.deprecatedSince,
    message: options.message,
    hitCount: existing?.hitCount ?? 0,
    lastHitAt: existing?.lastHitAt,
  });
}

export function recordDeprecatedHit(method: string, route: string): boolean {
  const key = routeKey(method, route);
  const entry = deprecatedRoutes.get(key);
  if (!entry) return false;
  entry.hitCount += 1;
  entry.lastHitAt = new Date();
  return true;
}

export function isDeprecated(method: string, route: string): boolean {
  return deprecatedRoutes.has(routeKey(method, route));
}

export function getDeprecationEntry(
  method: string,
  route: string
): DeprecationEntry | undefined {
  return deprecatedRoutes.get(routeKey(method, route));
}

export function getAllDeprecations(): DeprecationEntry[] {
  return Array.from(deprecatedRoutes.values());
}

export function removeDeprecation(method: string, route: string): void {
  deprecatedRoutes.delete(routeKey(method, route));
}

export function clearDeprecations(): void {
  deprecatedRoutes.clear();
}
