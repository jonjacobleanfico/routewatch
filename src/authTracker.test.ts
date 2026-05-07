import {
  recordAuthEvent,
  getAuthStats,
  getAllAuthStats,
  getAuthLog,
  getFailureRate,
  clearAuthLog,
  AuthEvent,
} from './authTracker';

function makeEvent(overrides: Partial<AuthEvent> = {}): AuthEvent {
  return {
    method: 'GET',
    path: '/api/data',
    outcome: 'success',
    timestamp: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  clearAuthLog();
});

test('records a successful auth event', () => {
  recordAuthEvent(makeEvent({ outcome: 'success' }));
  const stats = getAuthStats('GET', '/api/data');
  expect(stats?.successes).toBe(1);
  expect(stats?.failures).toBe(0);
});

test('records a failed auth event with reason', () => {
  recordAuthEvent(makeEvent({ outcome: 'failure', reason: 'invalid_token' }));
  const stats = getAuthStats('GET', '/api/data');
  expect(stats?.failures).toBe(1);
  expect(stats?.failureReasons['invalid_token']).toBe(1);
});

test('accumulates multiple events', () => {
  recordAuthEvent(makeEvent({ outcome: 'success' }));
  recordAuthEvent(makeEvent({ outcome: 'success' }));
  recordAuthEvent(makeEvent({ outcome: 'failure', reason: 'expired' }));
  const stats = getAuthStats('GET', '/api/data');
  expect(stats?.successes).toBe(2);
  expect(stats?.failures).toBe(1);
});

test('computes failure rate correctly', () => {
  recordAuthEvent(makeEvent({ outcome: 'success' }));
  recordAuthEvent(makeEvent({ outcome: 'failure' }));
  recordAuthEvent(makeEvent({ outcome: 'failure' }));
  const rate = getFailureRate('GET', '/api/data');
  expect(rate).toBeCloseTo(2 / 3);
});

test('returns null failure rate for unknown route', () => {
  expect(getFailureRate('POST', '/unknown')).toBeNull();
});

test('getAllAuthStats returns all routes', () => {
  recordAuthEvent(makeEvent({ method: 'GET', path: '/a' }));
  recordAuthEvent(makeEvent({ method: 'POST', path: '/b', outcome: 'failure' }));
  const all = getAllAuthStats();
  expect(Object.keys(all)).toHaveLength(2);
  expect(all['GET /a']).toBeDefined();
  expect(all['POST /b']).toBeDefined();
});

test('getAuthLog returns all raw events', () => {
  recordAuthEvent(makeEvent());
  recordAuthEvent(makeEvent({ outcome: 'failure' }));
  expect(getAuthLog()).toHaveLength(2);
});

test('clearAuthLog resets state', () => {
  recordAuthEvent(makeEvent());
  clearAuthLog();
  expect(getAuthLog()).toHaveLength(0);
  expect(getAuthStats('GET', '/api/data')).toBeUndefined();
});
