// Circuit breaker state tracking per route
// States: CLOSED (normal), OPEN (blocking), HALF_OPEN (testing)

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerRule {
  failureThreshold: number;   // number of failures to trip open
  successThreshold: number;   // successes in HALF_OPEN to close
  timeoutMs: number;          // ms to wait before moving OPEN -> HALF_OPEN
}

export interface CircuitBreakerEntry {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureAt: number | null;
  trippedAt: number | null;
  rule: CircuitBreakerRule;
}

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

const circuits = new Map<string, CircuitBreakerEntry>();
const rules = new Map<string, CircuitBreakerRule>();

export function setCircuitBreakerRule(method: string, path: string, rule: CircuitBreakerRule): void {
  const key = routeKey(method, path);
  rules.set(key, rule);
  if (!circuits.has(key)) {
    circuits.set(key, { state: 'CLOSED', failures: 0, successes: 0, lastFailureAt: null, trippedAt: null, rule });
  } else {
    circuits.get(key)!.rule = rule;
  }
}

export function getCircuit(method: string, path: string): CircuitBreakerEntry | undefined {
  return circuits.get(routeKey(method, path));
}

export function getAllCircuits(): Record<string, CircuitBreakerEntry> {
  const result: Record<string, CircuitBreakerEntry> = {};
  circuits.forEach((v, k) => { result[k] = v; });
  return result;
}

export function recordCircuitResult(method: string, path: string, success: boolean): void {
  const key = routeKey(method, path);
  const entry = circuits.get(key);
  if (!entry) return;

  const now = Date.now();

  if (entry.state === 'OPEN') {
    if (entry.trippedAt !== null && now - entry.trippedAt >= entry.rule.timeoutMs) {
      entry.state = 'HALF_OPEN';
      entry.successes = 0;
    } else {
      return;
    }
  }

  if (success) {
    entry.successes += 1;
    entry.failures = 0;
    if (entry.state === 'HALF_OPEN' && entry.successes >= entry.rule.successThreshold) {
      entry.state = 'CLOSED';
      entry.trippedAt = null;
    }
  } else {
    entry.failures += 1;
    entry.successes = 0;
    entry.lastFailureAt = now;
    if (entry.failures >= entry.rule.failureThreshold) {
      entry.state = 'OPEN';
      entry.trippedAt = now;
    }
  }
}

export function isCircuitOpen(method: string, path: string): boolean {
  const entry = circuits.get(routeKey(method, path));
  if (!entry) return false;
  if (entry.state === 'OPEN') {
    const now = Date.now();
    if (entry.trippedAt !== null && now - entry.trippedAt >= entry.rule.timeoutMs) {
      entry.state = 'HALF_OPEN';
      entry.successes = 0;
      return false;
    }
    return true;
  }
  return false;
}

export function resetCircuit(method: string, path: string): void {
  const key = routeKey(method, path);
  const rule = rules.get(key);
  if (rule) {
    circuits.set(key, { state: 'CLOSED', failures: 0, successes: 0, lastFailureAt: null, trippedAt: null, rule });
  } else {
    circuits.delete(key);
  }
}

export function clearAllCircuits(): void {
  circuits.clear();
  rules.clear();
}
