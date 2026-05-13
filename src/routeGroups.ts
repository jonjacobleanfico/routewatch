const groupMap: Map<string, Set<string>> = new Map();
const routeToGroup: Map<string, string> = new Map();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function addRouteToGroup(group: string, method: string, path: string): void {
  const key = routeKey(method, path);
  if (!groupMap.has(group)) {
    groupMap.set(group, new Set());
  }
  groupMap.get(group)!.add(key);
  routeToGroup.set(key, group);
}

export function removeRouteFromGroup(group: string, method: string, path: string): void {
  const key = routeKey(method, path);
  groupMap.get(group)?.delete(key);
  if (routeToGroup.get(key) === group) {
    routeToGroup.delete(key);
  }
}

export function getRoutesInGroup(group: string): string[] {
  return Array.from(groupMap.get(group) ?? []);
}

export function getGroupForRoute(method: string, path: string): string | undefined {
  return routeToGroup.get(routeKey(method, path));
}

export function getAllGroups(): string[] {
  return Array.from(groupMap.keys());
}

export function deleteGroup(group: string): void {
  const routes = groupMap.get(group);
  if (routes) {
    for (const key of routes) {
      routeToGroup.delete(key);
    }
  }
  groupMap.delete(group);
}

export function clearAllGroups(): void {
  groupMap.clear();
  routeToGroup.clear();
}
