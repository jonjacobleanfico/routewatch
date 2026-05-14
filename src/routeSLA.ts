// Route SLA (Service Level Agreement) tracker
// Tracks whether routes meet defined response time thresholds

interface SLARule {
  route: string;
  method: string;
  maxResponseTimeMs: number;
  maxErrorRate: number; // 0-1
}

interface SLAViolation {
  route: string;
  method: string;
  timestamp: number;
  type: 'response_time' | 'error_rate';
  actual: number;
  threshold: number;
}

interface SLAStatus {
  rule: SLARule;
  violations: SLAViolation[];
  passing: boolean;
  violationCount: number;
}

const slaRules = new Map<string, SLARule>();
const slaViolations: SLAViolation[] = [];

export function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()}:${route}`;
}

export function setSLARule(rule: SLARule): void {
  const key = routeKey(rule.method, rule.route);
  slaRules.set(key, rule);
}

export function removeSLARule(method: string, route: string): boolean {
  return slaRules.delete(routeKey(method, route));
}

export function getSLARule(method: string, route: string): SLARule | undefined {
  return slaRules.get(routeKey(method, route));
}

export function getAllSLARules(): SLARule[] {
  return Array.from(slaRules.values());
}

export function recordSLACheck(
  method: string,
  route: string,
  responseTimeMs: number,
  isError: boolean
): SLAViolation[] {
  const key = routeKey(method, route);
  const rule = slaRules.get(key);
  if (!rule) return [];

  const newViolations: SLAViolation[] = [];
  const timestamp = Date.now();

  if (responseTimeMs > rule.maxResponseTimeMs) {
    const v: SLAViolation = {
      route,
      method: method.toUpperCase(),
      timestamp,
      type: 'response_time',
      actual: responseTimeMs,
      threshold: rule.maxResponseTimeMs,
    };
    slaViolations.push(v);
    newViolations.push(v);
  }

  if (isError) {
    const v: SLAViolation = {
      route,
      method: method.toUpperCase(),
      timestamp,
      type: 'error_rate',
      actual: 1,
      threshold: rule.maxErrorRate,
    };
    slaViolations.push(v);
    newViolations.push(v);
  }

  return newViolations;
}

export function getSLAStatus(method: string, route: string): SLAStatus | null {
  const rule = getSLARule(method, route);
  if (!rule) return null;
  const key = routeKey(method, route);
  const violations = slaViolations.filter(
    (v) => routeKey(v.method, v.route) === key
  );
  return { rule, violations, passing: violations.length === 0, violationCount: violations.length };
}

export function getAllSLAStatuses(): SLAStatus[] {
  return getAllSLARules().map((rule) => getSLAStatus(rule.method, rule.route)!);
}

export function clearSLAViolations(): void {
  slaViolations.length = 0;
}

export function clearSLARules(): void {
  slaRules.clear();
}
