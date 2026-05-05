import { generateReport, formatReportAsTable } from './reporter';
import { resetStats } from './tracker';

// Minimal hit shape compatible with tracker's recordHit
function makeHit(method: string, path: string, responseTime?: number) {
  return { method, path, responseTime: responseTime ?? 0 };
}

// We import recordHit directly to seed stats for testing
import { recordHit } from './tracker';

describe('generateReport', () => {
  beforeEach(() => {
    resetStats();
  });

  it('returns an empty routes array when no hits recorded', () => {
    const report = generateReport();
    expect(report.routes).toHaveLength(0);
    expect(report.totalRequests).toBe(0);
    expect(report.generatedAt).toBeInstanceOf(Date);
  });

  it('includes a route entry for each unique method+path combination', () => {
    recordHit(makeHit('GET', '/users', 120));
    recordHit(makeHit('POST', '/users', 80));
    recordHit(makeHit('GET', '/users', 95));

    const report = generateReport();
    expect(report.routes).toHaveLength(2);
    expect(report.totalRequests).toBe(3);
  });

  it('sorts routes by hit count descending', () => {
    recordHit(makeHit('GET', '/health', 10));
    recordHit(makeHit('GET', '/users', 50));
    recordHit(makeHit('GET', '/users', 60));
    recordHit(makeHit('GET', '/users', 40));

    const report = generateReport();
    expect(report.routes[0].path).toBe('/users');
    expect(report.routes[0].hits).toBe(3);
    expect(report.routes[1].path).toBe('/health');
  });

  it('calculates avgResponseTime correctly', () => {
    recordHit(makeHit('GET', '/ping', 100));
    recordHit(makeHit('GET', '/ping', 200));

    const report = generateReport();
    const entry = report.routes.find((r) => r.path === '/ping');
    expect(entry).toBeDefined();
    expect(entry!.avgResponseTime).toBeCloseTo(150, 1);
  });
});

describe('formatReportAsTable', () => {
  beforeEach(() => {
    resetStats();
  });

  it('returns a non-empty string containing route info', () => {
    recordHit(makeHit('GET', '/api/items', 55));
    const report = generateReport();
    const table = formatReportAsTable(report);

    expect(typeof table).toBe('string');
    expect(table).toContain('GET');
    expect(table).toContain('/api/items');
    expect(table).toContain('1');
  });

  it('includes total requests in output', () => {
    recordHit(makeHit('DELETE', '/api/items/1', 30));
    recordHit(makeHit('DELETE', '/api/items/1', 25));
    const report = generateReport();
    const table = formatReportAsTable(report);

    expect(table).toContain('Total Requests: 2');
  });
});
