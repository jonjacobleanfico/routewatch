import {
  setAccessRule,
  getAccessRule,
  removeAccessRule,
  getAllAccessRules,
  clearAccessRules,
  checkAccess,
  routeKey,
} from './routeAccessControl';

beforeEach(() => {
  clearAccessRules();
});

describe('routeKey', () => {
  it('formats key correctly', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setAccessRule / getAccessRule', () => {
  it('stores and retrieves a rule', () => {
    setAccessRule('GET', '/users', { roles: ['admin'] });
    expect(getAccessRule('GET', '/users')).toEqual({ roles: ['admin'] });
  });

  it('returns undefined for unknown routes', () => {
    expect(getAccessRule('POST', '/unknown')).toBeUndefined();
  });
});

describe('removeAccessRule', () => {
  it('removes an existing rule', () => {
    setAccessRule('GET', '/users', { roles: ['admin'] });
    expect(removeAccessRule('GET', '/users')).toBe(true);
    expect(getAccessRule('GET', '/users')).toBeUndefined();
  });

  it('returns false when rule does not exist', () => {
    expect(removeAccessRule('DELETE', '/nope')).toBe(false);
  });
});

describe('getAllAccessRules', () => {
  it('returns all rules', () => {
    setAccessRule('GET', '/a', { roles: ['user'] });
    setAccessRule('POST', '/b', { methods: ['POST'] });
    const all = getAllAccessRules();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe('checkAccess', () => {
  it('allows when no rule exists', () => {
    expect(checkAccess('GET', '/free')).toEqual({ allowed: true });
  });

  it('denies when method not in allowed methods', () => {
    setAccessRule('DELETE', '/items', { methods: ['GET', 'POST'] });
    const result = checkAccess('DELETE', '/items');
    expect(result.allowed).toBe(false);
  });

  it('denies when role not in allowed roles', () => {
    setAccessRule('GET', '/admin', { roles: ['admin'] });
    expect(checkAccess('GET', '/admin', 'user').allowed).toBe(false);
  });

  it('allows when role matches', () => {
    setAccessRule('GET', '/admin', { roles: ['admin'] });
    expect(checkAccess('GET', '/admin', 'admin').allowed).toBe(true);
  });

  it('denies when no role provided and roles required', () => {
    setAccessRule('GET', '/secure', { roles: ['admin'] });
    const result = checkAccess('GET', '/secure');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('none');
  });
});
