import { getStats } from './tracker';

export interface HeatmapCell {
  hour: number;
  day: number;
  count: number;
}

export interface HeatmapData {
  cells: HeatmapCell[];
  maxCount: number;
  route?: string;
}

const hitTimestamps: Array<{ route: string; method: string; timestamp: Date }> = [];

export function recordHeatmapHit(route: string, method: string, timestamp: Date = new Date()): void {
  hitTimestamps.push({ route, method, timestamp });
}

export function getHeatmapData(route?: string): HeatmapData {
  const filtered = route
    ? hitTimestamps.filter((h) => h.route === route)
    : hitTimestamps;

  const counts: Record<string, number> = {};

  for (const hit of filtered) {
    const hour = hit.timestamp.getHours();
    const day = hit.timestamp.getDay();
    const key = `${day}:${hour}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const cells: HeatmapCell[] = [];
  let maxCount = 0;

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const count = counts[`${day}:${hour}`] ?? 0;
      if (count > maxCount) maxCount = count;
      cells.push({ hour, day, count });
    }
  }

  return { cells, maxCount, route };
}

export function clearHeatmapData(): void {
  hitTimestamps.length = 0;
}

export function getTopHours(limit = 5): Array<{ hour: number; count: number }> {
  const hourCounts: Record<number, number> = {};
  for (const hit of hitTimestamps) {
    const hour = hit.timestamp.getHours();
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  }
  return Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
