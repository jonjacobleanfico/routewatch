export interface RouteDoc {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  params?: Record<string, string>;
  responses?: Record<string, string>;
  example?: string;
  updatedAt: string;
}

const docStore = new Map<string, RouteDoc>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteDoc(
  method: string,
  path: string,
  doc: Omit<RouteDoc, 'method' | 'path' | 'updatedAt'>
): RouteDoc {
  const key = routeKey(method, path);
  const entry: RouteDoc = {
    method: method.toUpperCase(),
    path,
    ...doc,
    updatedAt: new Date().toISOString(),
  };
  docStore.set(key, entry);
  return entry;
}

export function getRouteDoc(method: string, path: string): RouteDoc | undefined {
  return docStore.get(routeKey(method, path));
}

export function removeRouteDoc(method: string, path: string): boolean {
  return docStore.delete(routeKey(method, path));
}

export function getAllRouteDocs(): RouteDoc[] {
  return Array.from(docStore.values());
}

export function clearRouteDocs(): void {
  docStore.clear();
}

export function updateRouteDoc(
  method: string,
  path: string,
  updates: Partial<Omit<RouteDoc, 'method' | 'path' | 'updatedAt'>>
): RouteDoc | undefined {
  const existing = getRouteDoc(method, path);
  if (!existing) return undefined;
  return setRouteDoc(method, path, { ...existing, ...updates });
}
