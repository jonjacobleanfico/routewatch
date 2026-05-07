import { Request, Response, NextFunction } from "express";
import { recordCustomHeaders } from "./customHeaders";

export interface CustomHeadersMiddlewareOptions {
  /** List of header names to watch (case-insensitive) */
  headers: string[];
}

/**
 * Middleware that records the values of specified request headers per route.
 * Must be mounted after routewatch middleware so that req.route is populated,
 * or it falls back to req.path.
 */
export function customHeadersMiddleware(
  options: CustomHeadersMiddlewareOptions
) {
  const { headers } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", () => {
      const method = req.method;
      const path: string =
        (req.route?.path as string | undefined) ?? req.path;
      recordCustomHeaders(method, path, req.headers as Record<string, string | string[] | undefined>, headers);
    });
    next();
  };
}
