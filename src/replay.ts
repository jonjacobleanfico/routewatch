import { RouteHit } from './tracker';

type ReplayHandler = (hit: RouteHit) => void;

const replayHandlers: ReplayHandler[] = [];
let replayLog: RouteHit[] = [];
const MAX_REPLAY_LOG = 500;

export function recordForReplay(hit: RouteHit): void {
  replayLog.push({ ...hit });
  if (replayLog.length > MAX_REPLAY_LOG) {
    replayLog.shift();
  }
}

export function onReplay(handler: ReplayHandler): void {
  replayHandlers.push(handler);
}

export function replayHits(
  filter?: (hit: RouteHit) => boolean
): RouteHit[] {
  const hits = filter ? replayLog.filter(filter) : [...replayLog];
  for (const hit of hits) {
    for (const handler of replayHandlers) {
      handler(hit);
    }
  }
  return hits;
}

export function getReplayLog(): RouteHit[] {
  return [...replayLog];
}

export function clearReplayLog(): void {
  replayLog = [];
}

export function replayByRoute(method: string, path: string): RouteHit[] {
  return replayHits(
    (h) =>
      h.method.toUpperCase() === method.toUpperCase() && h.path === path
  );
}
