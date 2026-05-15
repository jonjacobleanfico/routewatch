// trafficShapeMiddleware.ts — Express middleware to record traffic shape hits

import { Request, Response, NextFunction } from 'express';
import { recordTrafficHit } from './routeTrafficShape';

export function trafficShapeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const method = req.method;
  const path = req.path;
  recordTrafficHit(method, path);
  next();
}
