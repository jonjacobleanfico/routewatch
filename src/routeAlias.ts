/**
 * routeAlias.ts
 * Allows routes to be registered under human-friendly aliases
 * for use in reports, dashboards, and exports.
 */

const aliasMap = new Map<string, string>(); // routeKey -> alias
const reverseMap = new Map<string, string>(); // alias -> routeKey

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function setAlias(method: string, path: string, alias: string): void {
  const key = routeKey(method, path);
  if (reverseMap.has(alias) && reverseMap.get(alias) !== key) {
    throw new Error(`Alias "${alias}" is already used by another route.`);
  }
  aliasMap.set(key, alias);
  reverseMap.set(alias, key);
}

export function getAlias(method: string, path: string): string | undefined {
  return aliasMap.get(routeKey(method, path));
}

export function removeAlias(method: string, path: string): boolean {
  const key = routeKey(method, path);
  const alias = aliasMap.get(key);
  if (!alias) return false;
  aliasMap.delete(key);
  reverseMap.delete(alias);
  return true;
}

export function resolveAlias(alias: string): string | undefined {
  return reverseMap.get(alias);
}

export function getAllAliases(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, alias] of aliasMap.entries()) {
    result[key] = alias;
  }
  return result;
}

export function clearAliases(): void {
  aliasMap.clear();
  reverseMap.clear();
}
