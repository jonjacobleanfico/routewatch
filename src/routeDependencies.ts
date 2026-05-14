// Tracks declared dependencies between routes (e.g. route A calls route B internally)

export interface RouteDependency {
  from: string;
  to: string;
  label?: string;
  addedAt: string;
}

const dependencyMap = new Map<string, Map<string, RouteDependency>>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function addDependency(fromMethod: string, fromPath: string, toMethod: string, toPath: string, label?: string): RouteDependency {
  const from = routeKey(fromMethod, fromPath);
  const to = routeKey(toMethod, toPath);

  if (!dependencyMap.has(from)) {
    dependencyMap.set(from, new Map());
  }

  const dep: RouteDependency = { from, to, label, addedAt: new Date().toISOString() };
  dependencyMap.get(from)!.set(to, dep);
  return dep;
}

export function removeDependency(fromMethod: string, fromPath: string, toMethod: string, toPath: string): boolean {
  const from = routeKey(fromMethod, fromPath);
  const to = routeKey(toMethod, toPath);
  return dependencyMap.get(from)?.delete(to) ?? false;
}

export function getDependencies(method: string, path: string): RouteDependency[] {
  const key = routeKey(method, path);
  return Array.from(dependencyMap.get(key)?.values() ?? []);
}

export function getDependents(method: string, path: string): RouteDependency[] {
  const key = routeKey(method, path);
  const result: RouteDependency[] = [];
  for (const deps of dependencyMap.values()) {
    for (const dep of deps.values()) {
      if (dep.to === key) result.push(dep);
    }
  }
  return result;
}

export function getAllDependencies(): RouteDependency[] {
  const result: RouteDependency[] = [];
  for (const deps of dependencyMap.values()) {
    result.push(...deps.values());
  }
  return result;
}

export function clearDependencies(): void {
  dependencyMap.clear();
}
