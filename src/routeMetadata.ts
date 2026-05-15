/**
 * routeMetadata.ts
 * Store and retrieve arbitrary metadata key-value pairs for routes.
 */

type MetadataMap = Record<string, unknown>;

const store = new Map<string, MetadataMap>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setMetadata(method: string, path: string, key: string, value: unknown): void {
  const rk = routeKey(method, path);
  if (!store.has(rk)) {
    store.set(rk, {});
  }
  store.get(rk)![key] = value;
}

export function getMetadata(method: string, path: string, key: string): unknown | undefined {
  const rk = routeKey(method, path);
  return store.get(rk)?.[key];
}

export function getAllMetadata(method: string, path: string): MetadataMap {
  const rk = routeKey(method, path);
  return store.get(rk) ?? {};
}

export function removeMetadataKey(method: string, path: string, key: string): boolean {
  const rk = routeKey(method, path);
  const entry = store.get(rk);
  if (!entry || !(key in entry)) return false;
  delete entry[key];
  return true;
}

export function clearMetadata(method: string, path: string): void {
  const rk = routeKey(method, path);
  store.delete(rk);
}

export function getAllRouteMetadata(): Record<string, MetadataMap> {
  const result: Record<string, MetadataMap> = {};
  for (const [key, value] of store.entries()) {
    result[key] = { ...value };
  }
  return result;
}

export function clearAllMetadata(): void {
  store.clear();
}
