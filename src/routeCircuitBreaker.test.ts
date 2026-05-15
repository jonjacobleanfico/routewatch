import {
  setCircuitBreakerRule,
  recordCircuitResult,
  isCircuitOpen,
  getCircuit,
  getAllCircuits,
  resetCircuit,
  clearAllCircuits,
  CircuitBreakerRule,
} from './routeCircuitBreaker';

const defaultRule: CircuitBreakerRule = { failureThreshold: 3, successThreshold: 2, timeoutMs: 1000 };

beforeEach(() => clearAllCircuits());

describe('setCircuitBreakerRule', () => {
  it('creates a CLOSED circuit entry', () => {
    setCircuitBreakerRule('GET', '/api/test', defaultRule);
    const entry = getCircuit('GET', '/api/test');
    expect(entry).toBeDefined();
    expect(entry!.state).toBe('CLOSED');
    expect(entry!.failures).toBe(0);
  });

  it('updates rule without resetting state', () => {
    setCircuitBreakerRule('GET', '/api/test', defaultRule);
    recordCircuitResult('GET', '/api/test', false);
    setCircuitBreakerRule('GET', '/api/test', { ...defaultRule, failureThreshold: 10 });
    const entry = getCircuit('GET', '/api/test');
    expect(entry!.failures).toBe(1);
    expect(entry!.rule.failureThreshold).toBe(10);
  });
});

describe('recordCircuitResult', () => {
  it('increments failures on failure', () => {
    setCircuitBreakerRule('POST', '/api/data', defaultRule);
    recordCircuitResult('POST', '/api/data', false);
    expect(getCircuit('POST', '/api/data')!.failures).toBe(1);
  });

  it('trips circuit OPEN after threshold failures', () => {
    setCircuitBreakerRule('GET', '/api/flaky', defaultRule);
    recordCircuitResult('GET', '/api/flaky', false);
    recordCircuitResult('GET', '/api/flaky', false);
    recordCircuitResult('GET', '/api/flaky', false);
    expect(getCircuit('GET', '/api/flaky')!.state).toBe('OPEN');
  });

  it('resets failure count on success', () => {
    setCircuitBreakerRule('GET', '/api/ok', defaultRule);
    recordCircuitResult('GET', '/api/ok', false);
    recordCircuitResult('GET', '/api/ok', true);
    expect(getCircuit('GET', '/api/ok')!.failures).toBe(0);
  });
});

describe('isCircuitOpen', () => {
  it('returns false for CLOSED circuit', () => {
    setCircuitBreakerRule('GET', '/api/good', defaultRule);
    expect(isCircuitOpen('GET', '/api/good')).toBe(false);
  });

  it('returns true for OPEN circuit within timeout', () => {
    setCircuitBreakerRule('GET', '/api/bad', { ...defaultRule, timeoutMs: 60000 });
    for (let i = 0; i < 3; i++) recordCircuitResult('GET', '/api/bad', false);
    expect(isCircuitOpen('GET', '/api/bad')).toBe(true);
  });

  it('transitions OPEN -> HALF_OPEN after timeout', () => {
    setCircuitBreakerRule('GET', '/api/timeout', { ...defaultRule, timeoutMs: 0 });
    for (let i = 0; i < 3; i++) recordCircuitResult('GET', '/api/timeout', false);
    expect(isCircuitOpen('GET', '/api/timeout')).toBe(false);
    expect(getCircuit('GET', '/api/timeout')!.state).toBe('HALF_OPEN');
  });
});

describe('HALF_OPEN recovery', () => {
  it('closes circuit after enough successes in HALF_OPEN', () => {
    setCircuitBreakerRule('GET', '/api/recover', { ...defaultRule, timeoutMs: 0 });
    for (let i = 0; i < 3; i++) recordCircuitResult('GET', '/api/recover', false);
    isCircuitOpen('GET', '/api/recover'); // trigger transition
    recordCircuitResult('GET', '/api/recover', true);
    recordCircuitResult('GET', '/api/recover', true);
    expect(getCircuit('GET', '/api/recover')!.state).toBe('CLOSED');
  });
});

describe('resetCircuit / getAllCircuits', () => {
  it('resets circuit to CLOSED', () => {
    setCircuitBreakerRule('GET', '/api/reset', defaultRule);
    for (let i = 0; i < 3; i++) recordCircuitResult('GET', '/api/reset', false);
    resetCircuit('GET', '/api/reset');
    expect(getCircuit('GET', '/api/reset')!.state).toBe('CLOSED');
  });

  it('getAllCircuits returns all entries', () => {
    setCircuitBreakerRule('GET', '/a', defaultRule);
    setCircuitBreakerRule('POST', '/b', defaultRule);
    const all = getAllCircuits();
    expect(Object.keys(all)).toHaveLength(2);
  });
});
