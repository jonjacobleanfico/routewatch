import { Request, Response, NextFunction, RequestHandler } from 'express';
import { recordHit } from './tracker';

export interface RouteWatchOptions {
  /** Skip tracking for specific paths (e.g. health checks) */
  ignorePaths?: string[];
  /** Log each request to console in development */
  verbose?: boolean;
}

export function routewatch(options: RouteWatchOptions = {}): RequestHandler {
  const { ignorePaths = [], verbose = false } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const path = req.path;

    if (ignorePaths.some((ignored) => path.startsWith(ignored))) {
      return next();
    }

    const startTime = Date.now();

    res.on('finish', () => {
      const responseTimeMs = Date.now() - startTime;
      const method = req.method.toUpperCase();
      const statusCode = res.statusCode;

      recordHit({
        method,
        path,
        statusCode,
        responseTimeMs,
        timestamp: new Date(),
      });

      if (verbose) {
        console.log(
          `[routewatch] ${method} ${path} → ${statusCode} (${responseTimeMs}ms)`
        );
      }
    });

    next();
  };
}
