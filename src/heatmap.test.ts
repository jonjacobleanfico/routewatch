import {
  recordHeatmapHit,
  getHeatmapData,
  clearHeatmapData,
  getTopHours,
  HeatmapCell,
} from './heatmap';

beforeEach(() => {
  clearHeatmapData();
});

function makeHit(route: string, day: number, hour: number) {
  const date = new Date(2024, 0, 7 + day); // week starting Sunday
  date.setHours(hour, 0, 0, 0);
  recordHeatmapHit(route, 'GET', date);
}

describe('getHeatmapData', () => {
  it('returns empty cells with maxCount 0 when no hits', () => {
    const data = getHeatmapData();
    expect(data.cells).toHaveLength(7 * 24);
    expect(data.maxCount).toBe(0);
  });

  it('counts hits correctly by day and hour', () => {
    makeHit('/api/users', 1, 10);
    makeHit('/api/users', 1, 10);
    makeHit('/api/orders', 2, 14);

    const data = getHeatmapData();
    const cell = data.cells.find((c: HeatmapCell) => c.day === 1 && c.hour === 10);
    expect(cell?.count).toBe(2);
    expect(data.maxCount).toBe(2);
  });

  it('filters by route when provided', () => {
    makeHit('/api/users', 1, 10);
    makeHit('/api/orders', 1, 10);

    const data = getHeatmapData('/api/users');
    const cell = data.cells.find((c: HeatmapCell) => c.day === 1 && c.hour === 10);
    expect(cell?.count).toBe(1);
    expect(data.route).toBe('/api/users');
  });

  it('returns all 168 cells (7 days * 24 hours)', () => {
    const data = getHeatmapData();
    expect(data.cells).toHaveLength(168);
  });
});

describe('getTopHours', () => {
  it('returns top hours sorted by count descending', () => {
    makeHit('/api/test', 0, 9);
    makeHit('/api/test', 1, 9);
    makeHit('/api/test', 2, 9);
    makeHit('/api/test', 0, 14);
    makeHit('/api/test', 0, 14);

    const top = getTopHours(2);
    expect(top[0].hour).toBe(9);
    expect(top[0].count).toBe(3);
    expect(top[1].hour).toBe(14);
    expect(top[1].count).toBe(2);
  });

  it('respects limit parameter', () => {
    for (let i = 0; i < 10; i++) {
      makeHit('/api/test', 0, i);
    }
    const top = getTopHours(3);
    expect(top).toHaveLength(3);
  });
});

describe('clearHeatmapData', () => {
  it('removes all recorded hits', () => {
    makeHit('/api/test', 0, 10);
    clearHeatmapData();
    const data = getHeatmapData();
    expect(data.maxCount).toBe(0);
  });
});
