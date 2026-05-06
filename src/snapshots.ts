import { getStats } from './tracker';
import { RouteStats } from './tracker';

export interface Snapshot {
  id: string;
  label: string;
  createdAt: string;
  stats: Record<string, RouteStats>;
}

const snapshots: Map<string, Snapshot> = new Map();

function generateId(): string {
  return `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function takeSnapshot(label: string = ''): Snapshot {
  const id = generateId();
  const stats = getStats();
  const snapshot: Snapshot = {
    id,
    label: label || `Snapshot ${snapshots.size + 1}`,
    createdAt: new Date().toISOString(),
    stats: JSON.parse(JSON.stringify(stats)),
  };
  snapshots.set(id, snapshot);
  return snapshot;
}

export function getSnapshot(id: string): Snapshot | undefined {
  return snapshots.get(id);
}

export function listSnapshots(): Snapshot[] {
  return Array.from(snapshots.values());
}

export function deleteSnapshot(id: string): boolean {
  return snapshots.delete(id);
}

export function clearSnapshots(): void {
  snapshots.clear();
}

export function diffSnapshots(
  idA: string,
  idB: string
): Record<string, { before: RouteStats | null; after: RouteStats | null }> {
  const a = snapshots.get(idA);
  const b = snapshots.get(idB);
  if (!a || !b) throw new Error('One or both snapshot IDs not found');

  const keys = new Set([...Object.keys(a.stats), ...Object.keys(b.stats)]);
  const diff: Record<string, { before: RouteStats | null; after: RouteStats | null }> = {};

  for (const key of keys) {
    const before = a.stats[key] ?? null;
    const after = b.stats[key] ?? null;
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      diff[key] = { before, after };
    }
  }

  return diff;
}
