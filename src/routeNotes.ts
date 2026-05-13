// Route notes: attach freeform developer notes to routes

const notesStore = new Map<string, string[]>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function addNote(method: string, path: string, note: string): void {
  const key = routeKey(method, path);
  const existing = notesStore.get(key) ?? [];
  existing.push(note);
  notesStore.set(key, existing);
}

export function getNotes(method: string, path: string): string[] {
  const key = routeKey(method, path);
  return notesStore.get(key) ?? [];
}

export function removeNote(method: string, path: string, index: number): boolean {
  const key = routeKey(method, path);
  const existing = notesStore.get(key);
  if (!existing || index < 0 || index >= existing.length) return false;
  existing.splice(index, 1);
  if (existing.length === 0) {
    notesStore.delete(key);
  } else {
    notesStore.set(key, existing);
  }
  return true;
}

export function clearNotes(method: string, path: string): void {
  const key = routeKey(method, path);
  notesStore.delete(key);
}

export function getAllNotes(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, notes] of notesStore.entries()) {
    result[key] = [...notes];
  }
  return result;
}

export function clearAllNotes(): void {
  notesStore.clear();
}
