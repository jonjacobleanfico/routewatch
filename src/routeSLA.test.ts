import {
  setSLARule,
  removeSLARule,
  getSLARule,
  getAllSLARules,
  recordSLACheck,
  getSLAStatus,
  getAllSLAStatuses,
  clearSLAViolations,
  clearSLARules,
} from './routeSLA';

beforeEach(() => {
  clearSLARules();
  clearSLAViolations();
});

describe('setSLARule / getSLARule', () => {
  it('stores and retrieves a rule by method and route', () => {
    setSLARule({ route: '/api/users', method: 'GET', maxResponseTimeMs: 200, maxErrorRate: 0.05 });
    const rule = getSLARule('GET', '/api/users');
    expect(rule).toBeDefined();
    expect(rule?.maxResponseTimeMs).toBe(200);
  });

  it('returns undefined for unknown route', () => {
    expect(getSLARule('POST', '/unknown')).toBeUndefined();
  });

  it('overwrites an existing rule', () => {
    setSLARule({ route: '/api/users', method: 'GET', maxResponseTimeMs: 200, maxErrorRate: 0.05 });
    setSLARule({ route: '/api/users', method: 'GET', maxResponseTimeMs: 500, maxErrorRate: 0.1 });
    expect(getSLARule('GET', '/api/users')?.maxResponseTimeMs).toBe(500);
  });
});

describe('removeSLARule', () => {
  it('removes an existing rule', () => {
    setSLARule({ route: '/api/data', method: 'GET', maxResponseTimeMs: 300, maxErrorRate: 0.01 });
    expect(removeSLARule('GET', '/api/data')).toBe(true);
    expect(getSLARule('GET', '/api/data')).toBeUndefined();
  });

  it('returns false for non-existent rule', () => {
    expect(removeSLARule('DELETE', '/nope')).toBe(false);
  });
});

describe('getAllSLARules', () => {
  it('returns all registered rules', () => {
    setSLARule({ route: '/a', method: 'GET', maxResponseTimeMs: 100, maxErrorRate: 0 });
    setSLARule({ route: '/b', method: 'POST', maxResponseTimeMs: 200, maxErrorRate: 0.1 });
    expect(getAllSLARules()).toHaveLength(2);
  });
});

describe('recordSLACheck', () => {
  it('records no violations when within thresholds', () => {
    setSLARule({ route: '/api/ok', method: 'GET', maxResponseTimeMs: 500, maxErrorRate: 0.1 });
    const violations = recordSLACheck('GET', '/api/ok', 100, false);
    expect(violations).toHaveLength(0);
  });

  it('records a response_time violation when over threshold', () => {
    setSLARule({ route: '/api/slow', method: 'GET', maxResponseTimeMs: 100, maxErrorRate: 0.1 });
    const violations = recordSLACheck('GET', '/api/slow', 500, false);
    expect(violations).toHaveLength(1);
    expect(violations[0].type).toBe('response_time');
    expect(violations[0].actual).toBe(500);
  });

  it('records an error_rate violation on error', () => {
    setSLARule({ route: '/api/err', method: 'POST', maxResponseTimeMs: 1000, maxErrorRate: 0 });
    const violations = recordSLACheck('POST', '/api/err', 50, true);
    expect(violations.some((v) => v.type === 'error_rate')).toBe(true);
  });

  it('returns empty array for routes with no SLA rule', () => {
    const violations = recordSLACheck('GET', '/no-rule', 9999, true);
    expect(violations).toHaveLength(0);
  });
});

describe('getSLAStatus', () => {
  it('returns passing status when no violations', () => {
    setSLARule({ route: '/health', method: 'GET', maxResponseTimeMs: 200, maxErrorRate: 0.05 });
    recordSLACheck('GET', '/health', 50, false);
    const status = getSLAStatus('GET', '/health');
    expect(status?.passing).toBe(true);
    expect(status?.violationCount).toBe(0);
  });

  it('returns failing status when violations exist', () => {
    setSLARule({ route: '/heavy', method: 'GET', maxResponseTimeMs: 10, maxErrorRate: 0.05 });
    recordSLACheck('GET', '/heavy', 999, false);
    const status = getSLAStatus('GET', '/heavy');
    expect(status?.passing).toBe(false);
    expect(status?.violationCount).toBeGreaterThan(0);
  });

  it('returns null for unknown route', () => {
    expect(getSLAStatus('GET', '/unknown')).toBeNull();
  });
});

describe('getAllSLAStatuses', () => {
  it('returns statuses for all rules', () => {
    setSLARule({ route: '/x', method: 'GET', maxResponseTimeMs: 100, maxErrorRate: 0 });
    setSLARule({ route: '/y', method: 'GET', maxResponseTimeMs: 100, maxErrorRate: 0 });
    expect(getAllSLAStatuses()).toHaveLength(2);
  });
});
