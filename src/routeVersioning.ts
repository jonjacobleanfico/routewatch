const versionMap = new Map<string, string>();
const hitsByVersion = new Map<string, number>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteVersion(method: string, path: string, version: string): void {
  const key = routeKey(method, path);
  versionMap.set(key, version);
}

export function getRouteVersion(method: string, path: string): string | undefined {
  return versionMap.get(routeKey(method, path));
}

export function removeRouteVersion(method: string, path: string): boolean {
  return versionMap.delete(routeKey(method, path));
}

export function getAllVersions(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, version] of versionMap.entries()) {
    result[key] = version;
  }
  return result;
}

export function recordVersionHit(method: string, path: string): void {
  const version = getRouteVersion(method, path);
  if (!version) return;
  const count = hitsByVersion.get(version) ?? 0;
  hitsByVersion.set(version, count + 1);
}

export function getHitsByVersion(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [version, count] of hitsByVersion.entries()) {
    result[version] = count;
  }
  return result;
}

export function getRoutesForVersion(version: string): string[] {
  const routes: string[] = [];
  for (const [key, v] of versionMap.entries()) {
    if (v === version) routes.push(key);
  }
  return routes;
}

export function clearVersionData(): void {
  versionMap.clear();
  hitsByVersion.clear();
}
