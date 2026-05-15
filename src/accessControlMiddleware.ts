import { Request, Response, NextFunction } from 'express';
import { checkAccess } from './routeAccessControl';

export interface AccessControlOptions {
  getRoleFromRequest?: (req: Request) => string | undefined;
  onDenied?: (req: Request, res: Response, reason: string) => void;
}

export function accessControlMiddleware(options: AccessControlOptions = {}) {
  const { getRoleFromRequest, onDenied } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const method = req.method;
    const path = req.path;
    const role = getRoleFromRequest ? getRoleFromRequest(req) : undefined;

    const { allowed, reason } = checkAccess(method, path, role);

    if (!allowed) {
      if (onDenied) {
        onDenied(req, res, reason ?? 'Access denied');
      } else {
        res.status(403).json({ error: reason ?? 'Access denied' });
      }
      return;
    }

    next();
  };
}
