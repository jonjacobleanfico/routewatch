import {
  setTimeoutRule,
  removeTimeoutRule,
  getTimeoutRule,
  getAllTimeoutRules,
  recordTimeoutViolation,
  getTimeoutViolations,
  getViolationsByRoute,
  clearTimeoutData,
} from './routeTimeout';

beforeEach(() => clearTimeoutData());

describe('setTimeoutRule / getTimeoutRule', () => {
  it('stores and retrieves a rule', () => {
    setTimeoutRule('GET', '/api/slow', 500);
    const rule = getTimeoutRule('GET', '/api/slow');
    expect(rule).toBeDefined();
    expect(rule?.timeoutMs).toBe(500);
    expect(rule?.action).toBe('log');
  });

  it('stores rule with abort action', () => {
    setTimeoutRule('POST', '/api/upload', 3000, 'abort');
    const rule = getTimeoutRule('POST', '/api/upload');
    expect(rule?.action).toBe('abort');
  });

  it('normalizes method to uppercase', () => {
    setTimeoutRule('get', '/api/test', 200);
    const rule = getTimeoutRule('GET', '/api/test');
    expect(rule).toBeDefined();
  });

  it('returns undefined for unknown route', () => {
    expect(getTimeoutRule('GET', '/missing')).toBeUndefined();
  });
});

describe('removeTimeoutRule', () => {
  it('removes an existing rule', () => {
    setTimeoutRule('GET', '/api/x', 100);
    expect(removeTimeoutRule('GET', '/api/x')).toBe(true);
    expect(getTimeoutRule('GET', '/api/x')).toBeUndefined();
  });

  it('returns false for non-existent rule', () => {
    expect(removeTimeoutRule('DELETE', '/nope')).toBe(false);
  });
});

describe('getAllTimeoutRules', () => {
  it('returns all rules', () => {
    setTimeoutRule('GET', '/a', 100);
    setTimeoutRule('POST', '/b', 200);
    expect(getAllTimeoutRules()).toHaveLength(2);
  });
});

describe('recordTimeoutViolation / getTimeoutViolations', () => {
  it('records and retrieves violations', () => {
    recordTimeoutViolation('GET', '/api/slow', 750, 500);
    const violations = getTimeoutViolations();
    expect(violations).toHaveLength(1);
    expect(violations[0].durationMs).toBe(750);
    expect(violations[0].timeoutMs).toBe(500);
  });
});

describe('getViolationsByRoute', () => {
  it('filters violations by route', () => {
    recordTimeoutViolation('GET', '/a', 600, 500);
    recordTimeoutViolation('POST', '/b', 400, 300);
    const results = getViolationsByRoute('GET', '/a');
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe('/a');
  });
});

describe('clearTimeoutData', () => {
  it('clears rules and violations', () => {
    setTimeoutRule('GET', '/api/z', 100);
    recordTimeoutViolation('GET', '/api/z', 200, 100);
    clearTimeoutData();
    expect(getAllTimeoutRules()).toHaveLength(0);
    expect(getTimeoutViolations()).toHaveLength(0);
  });
});
