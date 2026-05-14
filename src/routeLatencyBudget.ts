/**
 * routeLatencyBudget.ts
 * Track and evaluate per-route latency budgets (acceptable response time thresholds).
 */

export interface LatencyBudget {
  route: string;
  method: string;
  maxMs: number;
  warnMs?: number;
}

export interface LatencyBudgetViolation {
  route: string;
  method: string;
  actualMs: number;
  maxMs: number;
  warnMs?: number;
  level: 'warn' | 'exceeded';
  timestamp: string;
}

function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()}:${route}`;
}

const budgets = new Map<string, LatencyBudget>();
const violations: LatencyBudgetViolation[] = [];

export function setLatencyBudget(budget: LatencyBudget): void {
  budgets.set(routeKey(budget.method, budget.route), budget);
}

export function removeLatencyBudget(method: string, route: string): boolean {
  return budgets.delete(routeKey(method, route));
}

export function getLatencyBudget(method: string, route: string): LatencyBudget | undefined {
  return budgets.get(routeKey(method, route));
}

export function getAllLatencyBudgets(): LatencyBudget[] {
  return Array.from(budgets.values());
}

export function evaluateLatencyBudget(
  method: string,
  route: string,
  actualMs: number
): LatencyBudgetViolation | null {
  const budget = budgets.get(routeKey(method, route));
  if (!budget) return null;

  if (actualMs > budget.maxMs) {
    const violation: LatencyBudgetViolation = {
      route,
      method: method.toUpperCase(),
      actualMs,
      maxMs: budget.maxMs,
      warnMs: budget.warnMs,
      level: 'exceeded',
      timestamp: new Date().toISOString(),
    };
    violations.push(violation);
    return violation;
  }

  if (budget.warnMs !== undefined && actualMs > budget.warnMs) {
    const violation: LatencyBudgetViolation = {
      route,
      method: method.toUpperCase(),
      actualMs,
      maxMs: budget.maxMs,
      warnMs: budget.warnMs,
      level: 'warn',
      timestamp: new Date().toISOString(),
    };
    violations.push(violation);
    return violation;
  }

  return null;
}

export function getViolations(): LatencyBudgetViolation[] {
  return [...violations];
}

export function clearViolations(): void {
  violations.length = 0;
}

export function clearAllBudgets(): void {
  budgets.clear();
  violations.length = 0;
}
