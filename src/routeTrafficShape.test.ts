import {
  recordTrafficHit,
  classifyShape,
  getTrafficShape,
  getAllTrafficShapes,
  clearTrafficShapeLog,
  TrafficWindow,
} from './routeTrafficShape';

beforeEach(() => {
  clearTrafficShapeLog();
});

function makeWindows(counts: number[]): TrafficWindow[] {
  return counts.map((count, i) => ({ timestamp: i * 10000, count }));
}

describe('classifyShape', () => {
  it('returns unknown for empty windows', () => {
    expect(classifyShape([])).toBe('unknown');
  });

  it('returns idle for very low counts', () => {
    expect(classifyShape(makeWindows([0, 1, 0, 1]))).toBe('idle');
  });

  it('returns burst when max is much higher than average', () => {
    expect(classifyShape(makeWindows([1, 1, 1, 25]))).toBe('burst');
  });

  it('returns steady for consistent moderate traffic', () => {
    expect(classifyShape(makeWindows([10, 12, 11, 10, 13]))).toBe('steady');
  });
});

describe('recordTrafficHit and getTrafficShape', () => {
  it('returns null for unknown route', () => {
    expect(getTrafficShape('GET', '/unknown')).toBeNull();
  });

  it('records a hit and returns shape entry', () => {
    recordTrafficHit('GET', '/api/users');
    const entry = getTrafficShape('GET', '/api/users');
    expect(entry).not.toBeNull();
    expect(entry!.route).toBe('GET /api/users');
    expect(entry!.windows.length).toBeGreaterThan(0);
    expect(entry!.windows[0].count).toBe(1);
  });

  it('accumulates hits in the same window', () => {
    recordTrafficHit('POST', '/api/items');
    recordTrafficHit('POST', '/api/items');
    recordTrafficHit('POST', '/api/items');
    const entry = getTrafficShape('POST', '/api/items');
    expect(entry!.windows[0].count).toBe(3);
  });
});

describe('getAllTrafficShapes', () => {
  it('returns all tracked routes', () => {
    recordTrafficHit('GET', '/a');
    recordTrafficHit('POST', '/b');
    const all = getAllTrafficShapes();
    expect(all.length).toBe(2);
    const routes = all.map(e => e.route);
    expect(routes).toContain('GET /a');
    expect(routes).toContain('POST /b');
  });
});

describe('clearTrafficShapeLog', () => {
  it('clears all data', () => {
    recordTrafficHit('GET', '/clear-me');
    clearTrafficShapeLog();
    expect(getAllTrafficShapes()).toHaveLength(0);
  });
});
