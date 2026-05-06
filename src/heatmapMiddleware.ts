import { Request, Response, NextFunction } from 'express';
import { recordHeatmapHit } from './heatmap';

export interface HeatmapMiddlewareOptions {
  /** Routes to exclude from heatmap tracking (exact match) */
  exclude?: string[];
  /** Only track routes matching this prefix */
  prefix?: string;
}

/**
 * Express middleware that automatically records hits for heatmap tracking.
 * Attach after routewatch() to capture route + timestamp data.
 */
export function heatmapMiddleware(options: HeatmapMiddlewareOptions = {}) {
  const { exclude = [], prefix } = options;

  return function (req: Request, _res: Response, next: NextFunction): void {
    const route = req.route?.path ?? req.path;
    const method = req.method;

    const shouldExclude = exclude.includes(route);
    const matchesPrefix = prefix ? route.startsWith(prefix) : true;

    if (!shouldExclude && matchesPrefix) {
      recordHeatmapHit(route, method, new Date());
    }

    next();
  };
}
