import {
  takeSnapshot,
  getSnapshot,
  listSnapshots,
  deleteSnapshot,
  clearSnapshots,
  diffSnapshots,
} from './snapshots';
import { resetStats, recordHit } from './tracker';

function makeHit(route: string, method = 'GET', status = 200, duration = 50) {
  return { route, method, status, duration, timestamp: new Date().toISOString() };
}

beforeEach(() => {
  resetStats();
  clearSnapshots();
});

test('takeSnapshot captures current stats', () => {
  recordHit(makeHit('/api/users'));
  const snap = takeSnapshot('first');
  expect(snap.label).toBe('first');
  expect(snap.stats['/api/users GET']).toBeDefined();
  expect(snap.stats['/api/users GET'].hits).toBe(1);
});

test('snapshot is immutable after creation', () => {
  recordHit(makeHit('/api/users'));
  const snap = takeSnapshot();
  recordHit(makeHit('/api/users'));
  expect(snap.stats['/api/users GET'].hits).toBe(1);
});

test('getSnapshot returns undefined for unknown id', () => {
  expect(getSnapshot('nonexistent')).toBeUndefined();
});

test('listSnapshots returns all snapshots', () => {
  takeSnapshot('a');
  takeSnapshot('b');
  expect(listSnapshots()).toHaveLength(2);
});

test('deleteSnapshot removes a snapshot', () => {
  const snap = takeSnapshot();
  expect(deleteSnapshot(snap.id)).toBe(true);
  expect(getSnapshot(snap.id)).toBeUndefined();
});

test('deleteSnapshot returns false for unknown id', () => {
  expect(deleteSnapshot('bad_id')).toBe(false);
});

test('diffSnapshots returns changed routes', () => {
  recordHit(makeHit('/api/a'));
  const snapA = takeSnapshot('before');
  recordHit(makeHit('/api/a'));
  recordHit(makeHit('/api/b'));
  const snapB = takeSnapshot('after');

  const diff = diffSnapshots(snapA.id, snapB.id);
  expect(diff['/api/a GET']).toBeDefined();
  expect(diff['/api/b GET']).toBeDefined();
  expect(diff['/api/b GET'].before).toBeNull();
});

test('diffSnapshots throws for invalid ids', () => {
  expect(() => diffSnapshots('x', 'y')).toThrow('not found');
});
