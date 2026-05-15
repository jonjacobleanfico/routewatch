// mockMiddleware.ts — Express middleware that intercepts requests and returns mock responses

import { Request, Response, NextFunction } from "express";
import { getMock, incrementMockHit } from "./routeMock";

export function mockMiddleware() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const entry = getMock(req.method, req.path);

    if (!entry || !entry.enabled) {
      return next();
    }

    incrementMockHit(req.method, req.path);

    const { status, body, headers, delayMs } = entry.response;

    if (delayMs && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    res.status(status).json(body);
  };
}
