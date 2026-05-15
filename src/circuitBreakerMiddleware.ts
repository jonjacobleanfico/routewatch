import { Request, Response, NextFunction } from 'express';
import { isCircuitOpen, recordCircuitResult } from './routeCircuitBreaker';

/**
 * Middleware that checks circuit breaker state before passing the request on,
 * and records success/failure based on the response status code.
 */
export function circuitBreakerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = req.method;
  const path = req.route?.path ?? req.path;

  if (isCircuitOpen(method, path)) {
    res.status(503).json({
      error: 'Service temporarily unavailable',
      reason: 'Circuit breaker is open',
      route: `${method}:${path}`,
    });
    return;
  }

  const originalEnd = res.end.bind(res) as typeof res.end;

  // @ts-ignore
  res.end = function (...args: Parameters<typeof res.end>) {
    const statusCode = res.statusCode;
    const success = statusCode < 500;
    recordCircuitResult(method, path, success);
    return originalEnd(...args);
  };

  next();
}
