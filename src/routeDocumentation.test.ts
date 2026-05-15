import {
  setRouteDoc,
  getRouteDoc,
  removeRouteDoc,
  getAllRouteDocs,
  clearRouteDocs,
  updateRouteDoc,
  routeKey,
} from './routeDocumentation';

beforeEach(() => {
  clearRouteDocs();
});

describe('routeKey', () => {
  it('normalizes method to uppercase', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setRouteDoc', () => {
  it('stores and returns a route doc with updatedAt', () => {
    const doc = setRouteDoc('GET', '/users', { summary: 'List users' });
    expect(doc.method).toBe('GET');
    expect(doc.path).toBe('/users');
    expect(doc.summary).toBe('List users');
    expect(doc.updatedAt).toBeDefined();
  });

  it('overwrites an existing doc', () => {
    setRouteDoc('GET', '/users', { summary: 'Old' });
    const doc = setRouteDoc('GET', '/users', { summary: 'New' });
    expect(doc.summary).toBe('New');
    expect(getAllRouteDocs()).toHaveLength(1);
  });
});

describe('getRouteDoc', () => {
  it('returns undefined for unknown route', () => {
    expect(getRouteDoc('GET', '/missing')).toBeUndefined();
  });

  it('returns stored doc', () => {
    setRouteDoc('POST', '/items', { description: 'Create item' });
    const doc = getRouteDoc('POST', '/items');
    expect(doc?.description).toBe('Create item');
  });
});

describe('removeRouteDoc', () => {
  it('returns true when doc exists and is removed', () => {
    setRouteDoc('DELETE', '/items/:id', {});
    expect(removeRouteDoc('DELETE', '/items/:id')).toBe(true);
    expect(getRouteDoc('DELETE', '/items/:id')).toBeUndefined();
  });

  it('returns false when doc does not exist', () => {
    expect(removeRouteDoc('GET', '/nope')).toBe(false);
  });
});

describe('getAllRouteDocs', () => {
  it('returns all stored docs', () => {
    setRouteDoc('GET', '/a', { summary: 'A' });
    setRouteDoc('POST', '/b', { summary: 'B' });
    expect(getAllRouteDocs()).toHaveLength(2);
  });

  it('returns empty array when no docs', () => {
    expect(getAllRouteDocs()).toEqual([]);
  });
});

describe('updateRouteDoc', () => {
  it('merges updates into existing doc', () => {
    setRouteDoc('GET', '/users', { summary: 'List', description: 'Returns all users' });
    const updated = updateRouteDoc('GET', '/users', { summary: 'List users' });
    expect(updated?.summary).toBe('List users');
    expect(updated?.description).toBe('Returns all users');
  });

  it('returns undefined for non-existent route', () => {
    const result = updateRouteDoc('GET', '/ghost', { summary: 'Ghost' });
    expect(result).toBeUndefined();
  });
});
