import { RouteHit } from './tracker';

export interface CorsViolation {
  route: string;
  method: string;
  origin: string;
  timestamp: number;
}

const violations: CorsViolation[] = [];
const allowedOrigins: Set<string> = new Set();

export function setAllowedOrigins(origins: string[]): void {
  allowedOrigins.clear();
  origins.forEach(o => allowedOrigins.add(o));
}

export function getAllowedOrigins(): string[] {
  return Array.from(allowedOrigins);
}

export function recordCorsViolation(hit: RouteHit, origin: string): void {
  violations.push({
    route: hit.route,
    method: hit.method,
    origin,
    timestamp: hit.timestamp,
  });
}

export function checkCors(hit: RouteHit, origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.size === 0) return true;
  const allowed = allowedOrigins.has(origin) || allowedOrigins.has('*');
  if (!allowed) {
    recordCorsViolation(hit, origin);
  }
  return allowed;
}

export function getCorsViolations(): CorsViolation[] {
  return [...violations];
}

export function getCorsViolationsByRoute(): Record<string, CorsViolation[]> {
  return violations.reduce((acc, v) => {
    if (!acc[v.route]) acc[v.route] = [];
    acc[v.route].push(v);
    return acc;
  }, {} as Record<string, CorsViolation[]>);
}

export function clearCorsViolations(): void {
  violations.length = 0;
}
