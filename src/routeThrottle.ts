// Route-level throttle configuration: max requests per window per route

type ThrottleRule = {
  maxRequests: number;
  windowMs: number;
};

type ThrottleState = {
  count: number;
  windowStart: number;
};

const throttleRules = new Map<string, ThrottleRule>();
const throttleState = new Map<string, ThrottleState>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setThrottleRule(method: string, path: string, rule: ThrottleRule): void {
  throttleRules.set(routeKey(method, path), rule);
}

export function removeThrottleRule(method: string, path: string): void {
  const key = routeKey(method, path);
  throttleRules.delete(key);
  throttleState.delete(key);
}

export function getThrottleRule(method: string, path: string): ThrottleRule | undefined {
  return throttleRules.get(routeKey(method, path));
}

export function getAllThrottleRules(): Record<string, ThrottleRule> {
  return Object.fromEntries(throttleRules.entries());
}

export function checkThrottle(method: string, path: string): { allowed: boolean; remaining: number; resetMs: number } {
  const key = routeKey(method, path);
  const rule = throttleRules.get(key);

  if (!rule) return { allowed: true, remaining: -1, resetMs: 0 };

  const now = Date.now();
  let state = throttleState.get(key);

  if (!state || now - state.windowStart >= rule.windowMs) {
    state = { count: 0, windowStart: now };
    throttleState.set(key, state);
  }

  const remaining = rule.maxRequests - state.count;
  const resetMs = rule.windowMs - (now - state.windowStart);

  if (state.count >= rule.maxRequests) {
    return { allowed: false, remaining: 0, resetMs };
  }

  state.count += 1;
  return { allowed: true, remaining: remaining - 1, resetMs };
}

export function clearThrottleState(): void {
  throttleState.clear();
}

export function clearAllThrottleRules(): void {
  throttleRules.clear();
  throttleState.clear();
}
