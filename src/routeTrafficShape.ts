// routeTrafficShape.ts — tracks request pattern shapes (burst, steady, idle) per route

export interface TrafficWindow {
  timestamp: number;
  count: number;
}

export type TrafficShape = 'burst' | 'steady' | 'idle' | 'unknown';

export interface TrafficShapeEntry {
  route: string;
  shape: TrafficShape;
  windows: TrafficWindow[];
  lastUpdated: number;
}

const WINDOW_SIZE_MS = 10_000; // 10 seconds
const MAX_WINDOWS = 6;
const BURST_THRESHOLD = 20;
const IDLE_THRESHOLD = 1;

const shapeLog = new Map<string, TrafficWindow[]>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function recordTrafficHit(method: string, path: string): void {
  const key = routeKey(method, path);
  const now = Date.now();
  const windowStart = Math.floor(now / WINDOW_SIZE_MS) * WINDOW_SIZE_MS;

  if (!shapeLog.has(key)) shapeLog.set(key, []);
  const windows = shapeLog.get(key)!;

  const existing = windows.find(w => w.timestamp === windowStart);
  if (existing) {
    existing.count++;
  } else {
    windows.push({ timestamp: windowStart, count: 1 });
    if (windows.length > MAX_WINDOWS) windows.shift();
  }
}

export function classifyShape(windows: TrafficWindow[]): TrafficShape {
  if (windows.length === 0) return 'unknown';
  const counts = windows.map(w => w.count);
  const max = Math.max(...counts);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  if (max >= BURST_THRESHOLD && max > avg * 2) return 'burst';
  if (avg <= IDLE_THRESHOLD) return 'idle';
  return 'steady';
}

export function getTrafficShape(method: string, path: string): TrafficShapeEntry | null {
  const key = routeKey(method, path);
  const windows = shapeLog.get(key);
  if (!windows) return null;
  return {
    route: key,
    shape: classifyShape(windows),
    windows: [...windows],
    lastUpdated: Date.now(),
  };
}

export function getAllTrafficShapes(): TrafficShapeEntry[] {
  return Array.from(shapeLog.entries()).map(([route, windows]) => ({
    route,
    shape: classifyShape(windows),
    windows: [...windows],
    lastUpdated: Date.now(),
  }));
}

export function clearTrafficShapeLog(): void {
  shapeLog.clear();
}
