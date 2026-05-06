/**
 * filter.ts
 * Provides utilities for filtering route stats by method, path pattern, or status code.
 */

import { RouteStats } from './tracker';

export interface FilterOptions {
  method?: string | string[];
  pathPattern?: RegExp | string;
  statusCode?: number | number[];
  minHits?: number;
}

export function filterStats(
  stats: RouteStats[],
  options: FilterOptions
): RouteStats[] {
  return stats.filter((entry) => {
    if (options.method) {
      const methods = Array.isArray(options.method)
        ? options.method.map((m) => m.toUpperCase())
        : [options.method.toUpperCase()];
      if (!methods.includes(entry.method.toUpperCase())) return false;
    }

    if (options.pathPattern) {
      const pattern =
        typeof options.pathPattern === 'string'
          ? new RegExp(options.pathPattern)
          : options.pathPattern;
      if (!pattern.test(entry.path)) return false;
    }

    if (options.statusCode !== undefined) {
      const codes = Array.isArray(options.statusCode)
        ? options.statusCode
        : [options.statusCode];
      const entryCodes = Object.keys(entry.statusCodes).map(Number);
      const hasMatch = entryCodes.some((c) => codes.includes(c));
      if (!hasMatch) return false;
    }

    if (options.minHits !== undefined) {
      if (entry.hits < options.minHits) return false;
    }

    return true;
  });
}

export function sortStats(
  stats: RouteStats[],
  by: 'hits' | 'avgDuration' | 'path' = 'hits',
  order: 'asc' | 'desc' = 'desc'
): RouteStats[] {
  return [...stats].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    if (by === 'hits') {
      aVal = a.hits;
      bVal = b.hits;
    } else if (by === 'avgDuration') {
      aVal = a.avgDuration;
      bVal = b.avgDuration;
    } else {
      aVal = a.path;
      bVal = b.path;
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Returns the top N route stats entries after sorting.
 * Useful for quickly identifying the most (or least) active routes.
 *
 * @param stats - Array of RouteStats to select from
 * @param n - Maximum number of entries to return
 * @param by - Field to sort by before slicing
 * @param order - Sort order, defaults to 'desc'
 */
export function topStats(
  stats: RouteStats[],
  n: number,
  by: 'hits' | 'avgDuration' | 'path' = 'hits',
  order: 'asc' | 'desc' = 'desc'
): RouteStats[] {
  return sortStats(stats, by, order).slice(0, n);
}
