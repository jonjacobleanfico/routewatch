// Tracks changes to route metadata over time (deprecations, tag changes, alias updates, etc.)

export type ChangeType = 'deprecated' | 'undeprecated' | 'tag_added' | 'tag_removed' | 'alias_set' | 'alias_removed' | 'note_added' | 'note_removed' | 'group_added' | 'group_removed';

export interface ChangelogEntry {
  id: string;
  route: string;
  method: string;
  changeType: ChangeType;
  detail?: string;
  timestamp: number;
}

let changelog: ChangelogEntry[] = [];
let nextId = 1;

function generateId(): string {
  return `chg_${nextId++}`;
}

export function recordChange(
  method: string,
  route: string,
  changeType: ChangeType,
  detail?: string
): ChangelogEntry {
  const entry: ChangelogEntry = {
    id: generateId(),
    route,
    method: method.toUpperCase(),
    changeType,
    detail,
    timestamp: Date.now(),
  };
  changelog.push(entry);
  return entry;
}

export function getChangelog(): ChangelogEntry[] {
  return [...changelog];
}

export function getChangelogForRoute(method: string, route: string): ChangelogEntry[] {
  const key = `${method.toUpperCase()} ${route}`;
  return changelog.filter(e => `${e.method} ${e.route}` === key);
}

export function getChangelogByType(changeType: ChangeType): ChangelogEntry[] {
  return changelog.filter(e => e.changeType === changeType);
}

export function clearChangelog(): void {
  changelog = [];
  nextId = 1;
}
