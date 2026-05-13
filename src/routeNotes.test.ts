import {
  addNote,
  getNotes,
  removeNote,
  clearNotes,
  getAllNotes,
  clearAllNotes,
  routeKey,
} from './routeNotes';

beforeEach(() => {
  clearAllNotes();
});

describe('routeKey', () => {
  it('normalizes method to uppercase', () => {
    expect(routeKey('get', '/users')).toBe('GET /users');
  });
});

describe('addNote / getNotes', () => {
  it('adds a note and retrieves it', () => {
    addNote('GET', '/users', 'Returns all users');
    expect(getNotes('GET', '/users')).toEqual(['Returns all users']);
  });

  it('supports multiple notes per route', () => {
    addNote('POST', '/items', 'Creates an item');
    addNote('POST', '/items', 'Requires auth');
    expect(getNotes('POST', '/items')).toHaveLength(2);
  });

  it('returns empty array for unknown route', () => {
    expect(getNotes('DELETE', '/unknown')).toEqual([]);
  });
});

describe('removeNote', () => {
  it('removes a note by index', () => {
    addNote('GET', '/items', 'Note A');
    addNote('GET', '/items', 'Note B');
    const removed = removeNote('GET', '/items', 0);
    expect(removed).toBe(true);
    expect(getNotes('GET', '/items')).toEqual(['Note B']);
  });

  it('returns false for out-of-bounds index', () => {
    addNote('GET', '/items', 'Note A');
    expect(removeNote('GET', '/items', 5)).toBe(false);
  });

  it('deletes the key when last note is removed', () => {
    addNote('GET', '/solo', 'Only note');
    removeNote('GET', '/solo', 0);
    expect(getAllNotes()['GET /solo']).toBeUndefined();
  });
});

describe('clearNotes', () => {
  it('clears notes for a specific route', () => {
    addNote('GET', '/users', 'Note');
    clearNotes('GET', '/users');
    expect(getNotes('GET', '/users')).toEqual([]);
  });
});

describe('getAllNotes', () => {
  it('returns all notes across routes', () => {
    addNote('GET', '/a', 'A note');
    addNote('POST', '/b', 'B note');
    const all = getAllNotes();
    expect(all['GET /a']).toEqual(['A note']);
    expect(all['POST /b']).toEqual(['B note']);
  });
});

describe('clearAllNotes', () => {
  it('removes all stored notes', () => {
    addNote('GET', '/x', 'note');
    clearAllNotes();
    expect(getAllNotes()).toEqual({});
  });
});
