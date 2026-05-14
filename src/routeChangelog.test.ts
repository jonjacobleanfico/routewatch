import {
  recordChange,
  getChangelog,
  getChangelogForRoute,
  getChangelogByType,
  clearChangelog,
} from './routeChangelog';

beforeEach(() => {
  clearChangelog();
});

describe('recordChange', () => {
  it('records a change entry with correct fields', () => {
    const entry = recordChange('GET', '/api/users', 'deprecated', 'Use /api/v2/users instead');
    expect(entry.method).toBe('GET');
    expect(entry.route).toBe('/api/users');
    expect(entry.changeType).toBe('deprecated');
    expect(entry.detail).toBe('Use /api/v2/users instead');
    expect(entry.timestamp).toBeLessThanOrEqual(Date.now());
    expect(entry.id).toMatch(/^chg_/);
  });

  it('normalizes method to uppercase', () => {
    const entry = recordChange('post', '/api/items', 'tag_added', 'inventory');
    expect(entry.method).toBe('POST');
  });

  it('assigns unique ids', () => {
    const a = recordChange('GET', '/a', 'tag_added');
    const b = recordChange('GET', '/b', 'tag_added');
    expect(a.id).not.toBe(b.id);
  });
});

describe('getChangelog', () => {
  it('returns all recorded entries', () => {
    recordChange('GET', '/a', 'deprecated');
    recordChange('POST', '/b', 'alias_set', 'myalias');
    expect(getChangelog()).toHaveLength(2);
  });

  it('returns empty array when no entries', () => {
    expect(getChangelog()).toEqual([]);
  });
});

describe('getChangelogForRoute', () => {
  it('returns only entries for the given route and method', () => {
    recordChange('GET', '/api/users', 'deprecated');
    recordChange('GET', '/api/users', 'tag_added', 'v1');
    recordChange('POST', '/api/users', 'note_added');
    const entries = getChangelogForRoute('GET', '/api/users');
    expect(entries).toHaveLength(2);
    entries.forEach(e => {
      expect(e.method).toBe('GET');
      expect(e.route).toBe('/api/users');
    });
  });
});

describe('getChangelogByType', () => {
  it('filters entries by change type', () => {
    recordChange('GET', '/a', 'deprecated');
    recordChange('GET', '/b', 'tag_added');
    recordChange('POST', '/c', 'deprecated');
    const deprecated = getChangelogByType('deprecated');
    expect(deprecated).toHaveLength(2);
    deprecated.forEach(e => expect(e.changeType).toBe('deprecated'));
  });
});

describe('clearChangelog', () => {
  it('removes all entries and resets ids', () => {
    recordChange('GET', '/a', 'deprecated');
    clearChangelog();
    expect(getChangelog()).toHaveLength(0);
    const entry = recordChange('GET', '/b', 'alias_set');
    expect(entry.id).toBe('chg_1');
  });
});
