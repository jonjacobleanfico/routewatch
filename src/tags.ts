/**
 * tags.ts — Assign and manage custom tags for route grouping/filtering
 */

type TagMap = Map<string, Set<string>>;

const routeTags: TagMap = new Map();

/**
 * Assign one or more tags to a route pattern (e.g. '/api/users GET')
 */
export function addTag(route: string, ...tags: string[]): void {
  if (!routeTags.has(route)) {
    routeTags.set(route, new Set());
  }
  const set = routeTags.get(route)!;
  for (const tag of tags) {
    set.add(tag.trim().toLowerCase());
  }
}

/**
 * Remove a specific tag from a route
 */
export function removeTag(route: string, tag: string): void {
  routeTags.get(route)?.delete(tag.trim().toLowerCase());
}

/**
 * Get all tags for a given route
 */
export function getTagsForRoute(route: string): string[] {
  return Array.from(routeTags.get(route) ?? []);
}

/**
 * Get all routes that have a specific tag
 */
export function getRoutesByTag(tag: string): string[] {
  const normalized = tag.trim().toLowerCase();
  const result: string[] = [];
  for (const [route, tags] of routeTags.entries()) {
    if (tags.has(normalized)) {
      result.push(route);
    }
  }
  return result;
}

/**
 * Return a snapshot of all tag assignments
 */
export function getAllTags(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [route, tags] of routeTags.entries()) {
    out[route] = Array.from(tags);
  }
  return out;
}

/**
 * Check whether a route has a specific tag assigned
 */
export function hasTag(route: string, tag: string): boolean {
  return routeTags.get(route)?.has(tag.trim().toLowerCase()) ?? false;
}

/**
 * Clear all tag assignments (useful for testing)
 */
export function clearTags(): void {
  routeTags.clear();
}
