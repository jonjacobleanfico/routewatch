import { Request, Response, NextFunction } from 'express';
import { recordRequestCountHit } from './requestCount';

export function requestCountMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const path = req.route?.path ?? req.path;
  recordRequestCountHit(req.method, path);
  next();
}
