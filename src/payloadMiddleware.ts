/**
 * payloadMiddleware.ts
 * Express middleware that intercepts request and response bodies
 * to record payload metadata via payloadLogger.
 */

import { Request, Response, NextFunction } from "express";
import { recordPayload } from "./payloadLogger";

export function payloadMiddleware(req: Request, res: Response, next: NextFunction): void {
  const route = req.path;
  const method = req.method;
  const requestContentType = req.headers["content-type"];
  const requestBodySize = parseInt(req.headers["content-length"] ?? "0", 10) || 0;

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  let responseBodySize = 0;

  res.write = function (chunk: any, ...args: any[]): boolean {
    if (chunk) {
      responseBodySize += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk);
    }
    return originalWrite(chunk, ...args);
  };

  res.end = function (chunk?: any, ...args: any[]): Response {
    if (chunk) {
      responseBodySize += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(typeof chunk === "string" ? chunk : String(chunk));
    }

    recordPayload({
      method,
      route,
      requestContentType,
      requestBodySize,
      responseContentType: res.getHeader("content-type") as string | undefined,
      responseBodySize,
      timestamp: Date.now(),
    });

    return originalEnd(chunk, ...args);
  };

  next();
}
