import {
  setLatencyBudget,
  removeLatencyBudget,
  getLatencyBudget,
  getAllLatencyBudgets,
  evaluateLatencyBudget,
  getViolations,
  clearViolations,
  clearAllBudgets,
} from './routeLatencyBudget';

beforeEach(() => {
  clearAllBudgets();
});

describe('setLatencyBudget / getLatencyBudget', () => {
  it('stores and retrieves a budget', () => {
    setLatencyBudget({ route: '/api/users', method: 'GET', maxMs: 200 });
    const budget = getLatencyBudget('GET', '/api/users');
    expect(budget).toBeDefined();
    expect(budget?.maxMs).toBe(200);
  });

  it('is case-insensitive for method', () => {
    setLatencyBudget({ route: '/api/items', method: 'post', maxMs: 500 });
    expect(getLatencyBudget('POST', '/api/items')).toBeDefined();
    expect(getLatencyBudget('post', '/api/items')).toBeDefined();
  });

  it('returns undefined for unknown route', () => {
    expect(getLatencyBudget('GET', '/unknown')).toBeUndefined();
  });
});

describe('removeLatencyBudget', () => {
  it('removes an existing budget', () => {
    setLatencyBudget({ route: '/api/x', method: 'GET', maxMs: 100 });
    expect(removeLatencyBudget('GET', '/api/x')).toBe(true);
    expect(getLatencyBudget('GET', '/api/x')).toBeUndefined();
  });

  it('returns false when budget does not exist', () => {
    expect(removeLatencyBudget('DELETE', '/nope')).toBe(false);
  });
});

describe('getAllLatencyBudgets', () => {
  it('returns all registered budgets', () => {
    setLatencyBudget({ route: '/a', method: 'GET', maxMs: 100 });
    setLatencyBudget({ route: '/b', method: 'POST', maxMs: 300 });
    expect(getAllLatencyBudgets()).toHaveLength(2);
  });
});

describe('evaluateLatencyBudget', () => {
  it('returns null when no budget is set', () => {
    expect(evaluateLatencyBudget('GET', '/no-budget', 999)).toBeNull();
  });

  it('returns null when within budget', () => {
    setLatencyBudget({ route: '/api/fast', method: 'GET', maxMs: 200, warnMs: 100 });
    expect(evaluateLatencyBudget('GET', '/api/fast', 50)).toBeNull();
  });

  it('returns warn violation when between warnMs and maxMs', () => {
    setLatencyBudget({ route: '/api/warn', method: 'GET', maxMs: 300, warnMs: 150 });
    const v = evaluateLatencyBudget('GET', '/api/warn', 200);
    expect(v).not.toBeNull();
    expect(v?.level).toBe('warn');
    expect(v?.actualMs).toBe(200);
  });

  it('returns exceeded violation when over maxMs', () => {
    setLatencyBudget({ route: '/api/slow', method: 'POST', maxMs: 500 });
    const v = evaluateLatencyBudget('POST', '/api/slow', 600);
    expect(v).not.toBeNull();
    expect(v?.level).toBe('exceeded');
    expect(v?.route).toBe('/api/slow');
  });

  it('records violations in the log', () => {
    setLatencyBudget({ route: '/api/log', method: 'GET', maxMs: 100 });
    evaluateLatencyBudget('GET', '/api/log', 150);
    evaluateLatencyBudget('GET', '/api/log', 200);
    expect(getViolations()).toHaveLength(2);
  });
});

describe('clearViolations', () => {
  it('clears only violations, not budgets', () => {
    setLatencyBudget({ route: '/api/v', method: 'GET', maxMs: 50 });
    evaluateLatencyBudget('GET', '/api/v', 100);
    clearViolations();
    expect(getViolations()).toHaveLength(0);
    expect(getLatencyBudget('GET', '/api/v')).toBeDefined();
  });
});
