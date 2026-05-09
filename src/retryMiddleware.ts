import { Request, Response, NextFunction } from 'express';
import { recordRetry } from './retryTracker';

export function retryMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  const path = req.route?.path ?? req.path;
  recordRetry(req.method, path, ip);
  next();
}
