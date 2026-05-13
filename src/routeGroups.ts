/**
 * routeGroups.ts
 * Group routes under named labels for aggregated stats and organization.
 */

const groupMap = new Map<string, Set<string>>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function addRouteToGroup(groupName: string, method: string, path: string): void {
  const key = routeKey(method, path);
  if (!groupMap.has(groupName)) {
    groupMap.set(groupName, new Set());
  }
  groupMap.get(groupName)!.add(key);
}

export function removeRouteFromGroup(groupName: string, method: string, path: string): void {
  const key = routeKey(method, path);
  groupMap.get(groupName)?.delete(key);
}

export function getRoutesInGroup(groupName: string): string[] {
  return Array.from(groupMap.get(groupName) ?? []);
}

export function getGroupForRoute(method: string, path: string): string | undefined {
  const key = routeKey(method, path);
  for (const [group, routes] of groupMap.entries()) {
    if (routes.has(key)) return group;
  }
  return undefined;
}

export function getAllGroups(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [group, routes] of groupMap.entries()) {
    result[group] = Array.from(routes);
  }
  return result;
}

export function deleteGroup(groupName: string): boolean {
  return groupMap.delete(groupName);
}

export function clearAllGroups(): void {
  groupMap.clear();
}
