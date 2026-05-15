import { Request, Response, NextFunction } from 'express';
import { getTimeoutRule, recordTimeoutViolation } from './routeTimeout';

export function timeoutMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = req.method;
  const path = req.path;
  const rule = getTimeoutRule(method, path);

  if (!rule) {
    return next();
  }

  const start = Date.now();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    const duration = Date.now() - start;
    recordTimeoutViolation(method, path, duration, rule.timeoutMs);

    if (rule.action === 'abort' && !res.headersSent) {
      res.status(503).json({
        error: 'Request timeout',
        route: `${method} ${path}`,
        timeoutMs: rule.timeoutMs,
      });
    }
  }, rule.timeoutMs);

  res.on('finish', () => {
    clearTimeout(timer);
    if (!timedOut) {
      const duration = Date.now() - start;
      if (duration > rule.timeoutMs) {
        recordTimeoutViolation(method, path, duration, rule.timeoutMs);
      }
    }
  });

  next();
}
