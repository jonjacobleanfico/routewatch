import {
  addTag,
  removeTag,
  getTagsForRoute,
  getRoutesByTag,
  getAllTags,
  clearTags,
} from './tags';

beforeEach(() => {
  clearTags();
});

describe('addTag / getTagsForRoute', () => {
  it('adds a single tag to a route', () => {
    addTag('/api/users GET', 'auth');
    expect(getTagsForRoute('/api/users GET')).toEqual(['auth']);
  });

  it('adds multiple tags at once', () => {
    addTag('/api/orders POST', 'auth', 'billing');
    const tags = getTagsForRoute('/api/orders POST');
    expect(tags).toContain('auth');
    expect(tags).toContain('billing');
  });

  it('normalizes tags to lowercase', () => {
    addTag('/api/health GET', 'Public', '  INTERNAL  ');
    const tags = getTagsForRoute('/api/health GET');
    expect(tags).toContain('public');
    expect(tags).toContain('internal');
  });

  it('deduplicates tags', () => {
    addTag('/api/users GET', 'auth');
    addTag('/api/users GET', 'auth');
    expect(getTagsForRoute('/api/users GET')).toHaveLength(1);
  });

  it('returns empty array for unknown route', () => {
    expect(getTagsForRoute('/unknown')).toEqual([]);
  });
});

describe('removeTag', () => {
  it('removes an existing tag', () => {
    addTag('/api/users GET', 'auth', 'public');
    removeTag('/api/users GET', 'auth');
    expect(getTagsForRoute('/api/users GET')).toEqual(['public']);
  });

  it('does nothing for an unknown route', () => {
    expect(() => removeTag('/nope', 'auth')).not.toThrow();
  });
});

describe('getRoutesByTag', () => {
  it('returns routes with the given tag', () => {
    addTag('/api/users GET', 'auth');
    addTag('/api/orders GET', 'auth');
    addTag('/api/health GET', 'public');
    expect(getRoutesByTag('auth')).toEqual(
      expect.arrayContaining(['/api/users GET', '/api/orders GET'])
    );
    expect(getRoutesByTag('auth')).not.toContain('/api/health GET');
  });

  it('returns empty array when no routes match', () => {
    expect(getRoutesByTag('nonexistent')).toEqual([]);
  });
});

describe('getAllTags', () => {
  it('returns a snapshot of all assignments', () => {
    addTag('/api/users GET', 'auth');
    addTag('/api/health GET', 'public');
    const all = getAllTags();
    expect(all['/api/users GET']).toContain('auth');
    expect(all['/api/health GET']).toContain('public');
  });

  it('returns empty object when no tags set', () => {
    expect(getAllTags()).toEqual({});
  });
});
