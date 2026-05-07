/**
 * payloadRouter.ts
 * Express router exposing payload log data via HTTP endpoints.
 */

import { Router, Request, Response } from "express";
import {
  getPayloadLog,
  getPayloadsByRoute,
  getPayloadSummary,
  clearPayloadLog,
} from "./payloadLogger";

const router = Router();

// GET /payload — full log
router.get("/", (_req: Request, res: Response) => {
  res.json(getPayloadLog());
});

// GET /payload/summary — aggregated stats per route
router.get("/summary", (_req: Request, res: Response) => {
  res.json(getPayloadSummary());
});

// GET /payload/route?method=GET&path=/api/users
router.get("/route", (req: Request, res: Response) => {
  const method = req.query.method as string;
  const path = req.query.path as string;

  if (!method || !path) {
    res.status(400).json({ error: "method and path query params are required" });
    return;
  }

  res.json(getPayloadsByRoute(method, path));
});

// DELETE /payload — clear the log
router.delete("/", (_req: Request, res: Response) => {
  clearPayloadLog();
  res.json({ cleared: true });
});

export { router as payloadRouter };
