import { Request, Response, NextFunction } from 'express';
import { recordQueryParams } from './queryParams';

export function queryParamsMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const route = req.route?.path ?? req.path;
  const method = req.method;
  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      params[key] = value;
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      params[key] = value[0] as string;
    }
  }

  if (Object.keys(params).length > 0) {
    recordQueryParams(method, route, params);
  }

  next();
}
