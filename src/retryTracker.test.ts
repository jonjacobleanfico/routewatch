import { recordRetry, getRetryStats, getAllRetryStats, clearRetryLog } from './retryTracker';

function makeHit(method = 'GET', path = '/api/test', ip = '127.0.0.1') {
  return { method, path, ip };
}

describe('retryTracker', () => {
  beforeEach(() => {
    clearRetryLog();
  });

  it('records a single hit without counting it as a retry', () => {
    const { method, path, ip } = makeHit();
    recordRetry(method, path, ip);
    const stats = getRetryStats(method, path);
    expect(stats.entries).toHaveLength(0);
    expect(stats.totalRetries).toBe(0);
  });

  it('counts a second hit from the same IP within the window as a retry', () => {
    const { method, path, ip } = makeHit();
    recordRetry(method, path, ip);
    recordRetry(method, path, ip);
    const stats = getRetryStats(method, path);
    expect(stats.entries).toHaveLength(1);
    expect(stats.entries[0].count).toBe(2);
    expect(stats.totalRetries).toBe(2);
  });

  it('treats different IPs as separate entries', () => {
    recordRetry('GET', '/api/test', '1.1.1.1');
    recordRetry('GET', '/api/test', '1.1.1.1');
    recordRetry('GET', '/api/test', '2.2.2.2');
    recordRetry('GET', '/api/test', '2.2.2.2');
    const stats = getRetryStats('GET', '/api/test');
    expect(stats.uniqueIps).toBe(2);
    expect(stats.entries).toHaveLength(2);
  });

  it('tracks maxRetries correctly', () => {
    const { method, path, ip } = makeHit();
    recordRetry(method, path, ip);
    recordRetry(method, path, ip);
    recordRetry(method, path, ip);
    const stats = getRetryStats(method, path);
    expect(stats.maxRetries).toBe(3);
  });

  it('returns all stats across routes', () => {
    recordRetry('GET', '/a', '1.1.1.1');
    recordRetry('GET', '/a', '1.1.1.1');
    recordRetry('POST', '/b', '2.2.2.2');
    recordRetry('POST', '/b', '2.2.2.2');
    const all = getAllRetryStats();
    expect(Object.keys(all)).toContain('GET:/a');
    expect(Object.keys(all)).toContain('POST:/b');
  });

  it('clears the log', () => {
    recordRetry('GET', '/api/test', '1.1.1.1');
    clearRetryLog();
    const stats = getRetryStats('GET', '/api/test');
    expect(stats.entries).toHaveLength(0);
  });
});
