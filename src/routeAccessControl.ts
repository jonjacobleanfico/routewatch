// Route-level access control: define allowed roles/methods per route

export interface AccessRule {
  methods?: string[];
  roles?: string[];
}

type RouteKey = string;

const accessRules = new Map<RouteKey, AccessRule>();

export function routeKey(method: string, path: string): RouteKey {
  return `${method.toUpperCase()}:${path}`;
}

export function setAccessRule(method: string, path: string, rule: AccessRule): void {
  accessRules.set(routeKey(method, path), rule);
}

export function getAccessRule(method: string, path: string): AccessRule | undefined {
  return accessRules.get(routeKey(method, path));
}

export function removeAccessRule(method: string, path: string): boolean {
  return accessRules.delete(routeKey(method, path));
}

export function getAllAccessRules(): Record<string, AccessRule> {
  const result: Record<string, AccessRule> = {};
  for (const [key, rule] of accessRules.entries()) {
    result[key] = rule;
  }
  return result;
}

export function clearAccessRules(): void {
  accessRules.clear();
}

export function checkAccess(
  method: string,
  path: string,
  role?: string
): { allowed: boolean; reason?: string } {
  const rule = getAccessRule(method, path);
  if (!rule) return { allowed: true };

  if (rule.methods && !rule.methods.map(m => m.toUpperCase()).includes(method.toUpperCase())) {
    return { allowed: false, reason: `Method ${method} not allowed on ${path}` };
  }

  if (rule.roles && rule.roles.length > 0) {
    if (!role || !rule.roles.includes(role)) {
      return { allowed: false, reason: `Role '${role ?? 'none'}' not permitted on ${method}:${path}` };
    }
  }

  return { allowed: true };
}
