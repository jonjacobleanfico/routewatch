/**
 * routeEnvironment.ts
 * Track and manage environment tags per route (e.g. production, staging, dev)
 */

type Environment = string;

interface RouteEnvironmentEntry {
  method: string;
  path: string;
  environments: Set<Environment>;
}

function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

const environmentMap = new Map<string, RouteEnvironmentEntry>();

export function setRouteEnvironment(
  method: string,
  path: string,
  environments: Environment[]
): void {
  const key = routeKey(method, path);
  environmentMap.set(key, {
    method: method.toUpperCase(),
    path,
    environments: new Set(environments),
  });
}

export function addRouteEnvironment(
  method: string,
  path: string,
  environment: Environment
): void {
  const key = routeKey(method, path);
  const entry = environmentMap.get(key);
  if (entry) {
    entry.environments.add(environment);
  } else {
    environmentMap.set(key, {
      method: method.toUpperCase(),
      path,
      environments: new Set([environment]),
    });
  }
}

export function removeRouteEnvironment(
  method: string,
  path: string,
  environment: Environment
): void {
  const key = routeKey(method, path);
  environmentMap.get(key)?.environments.delete(environment);
}

export function getRouteEnvironments(
  method: string,
  path: string
): Environment[] {
  const key = routeKey(method, path);
  return Array.from(environmentMap.get(key)?.environments ?? []);
}

export function getRoutesByEnvironment(environment: Environment): Array<{ method: string; path: string }> {
  const results: Array<{ method: string; path: string }> = [];
  for (const entry of environmentMap.values()) {
    if (entry.environments.has(environment)) {
      results.push({ method: entry.method, path: entry.path });
    }
  }
  return results;
}

export function getAllRouteEnvironments(): Record<string, Environment[]> {
  const result: Record<string, Environment[]> = {};
  for (const [key, entry] of environmentMap.entries()) {
    result[key] = Array.from(entry.environments);
  }
  return result;
}

export function clearRouteEnvironments(): void {
  environmentMap.clear();
}
