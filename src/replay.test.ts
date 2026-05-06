import {
  recordForReplay,
  replayHits,
  replayByRoute,
  getReplayLog,
  clearReplayLog,
  onReplay,
} from './replay';
import { RouteHit } from './tracker';

function makeHit(overrides: Partial<RouteHit> = {}): RouteHit {
  return {
    method: 'GET',
    path: '/test',
    statusCode: 200,
    duration: 10,
    timestamp: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  clearReplayLog();
});

describe('recordForReplay', () => {
  it('stores hits in the replay log', () => {
    recordForReplay(makeHit());
    expect(getReplayLog()).toHaveLength(1);
  });

  it('caps log at MAX_REPLAY_LOG (500)', () => {
    for (let i = 0; i < 510; i++) {
      recordForReplay(makeHit({ path: `/route/${i}` }));
    }
    expect(getReplayLog().length).toBe(500);
  });
});

describe('replayHits', () => {
  it('returns all hits when no filter provided', () => {
    recordForReplay(makeHit({ path: '/a' }));
    recordForReplay(makeHit({ path: '/b' }));
    const result = replayHits();
    expect(result).toHaveLength(2);
  });

  it('applies filter when provided', () => {
    recordForReplay(makeHit({ path: '/a' }));
    recordForReplay(makeHit({ path: '/b' }));
    const result = replayHits((h) => h.path === '/a');
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/a');
  });

  it('calls registered handlers for each replayed hit', () => {
    const received: RouteHit[] = [];
    onReplay((h) => received.push(h));
    recordForReplay(makeHit());
    replayHits();
    expect(received).toHaveLength(1);
  });
});

describe('replayByRoute', () => {
  it('filters by method and path', () => {
    recordForReplay(makeHit({ method: 'GET', path: '/users' }));
    recordForReplay(makeHit({ method: 'POST', path: '/users' }));
    const result = replayByRoute('GET', '/users');
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('GET');
  });

  it('is case-insensitive for method', () => {
    recordForReplay(makeHit({ method: 'DELETE', path: '/item' }));
    const result = replayByRoute('delete', '/item');
    expect(result).toHaveLength(1);
  });
});

describe('clearReplayLog', () => {
  it('empties the log', () => {
    recordForReplay(makeHit());
    clearReplayLog();
    expect(getReplayLog()).toHaveLength(0);
  });
});
