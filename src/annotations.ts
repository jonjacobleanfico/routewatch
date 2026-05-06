/**
 * annotations.ts
 * Attach human-readable notes/annotations to specific routes for documentation
 * and context during development.
 */

type AnnotationMap = Map<string, string>;

const annotations: AnnotationMap = new Map();

/**
 * Set an annotation for a route (method + path key).
 * e.g. setAnnotation('GET /users', 'Returns paginated list of users')
 */
export function setAnnotation(route: string, note: string): void {
  annotations.set(route, note);
}

/**
 * Retrieve the annotation for a given route key, or undefined if none.
 */
export function getAnnotation(route: string): string | undefined {
  return annotations.get(route);
}

/**
 * Remove an annotation for a given route key.
 */
export function removeAnnotation(route: string): boolean {
  return annotations.delete(route);
}

/**
 * Return all annotations as a plain object.
 */
export function getAllAnnotations(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [route, note] of annotations.entries()) {
    result[route] = note;
  }
  return result;
}

/**
 * Clear all stored annotations.
 */
export function clearAnnotations(): void {
  annotations.clear();
}
