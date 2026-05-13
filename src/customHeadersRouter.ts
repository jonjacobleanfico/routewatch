import { Router } from "express";
import {
  getAllHeaderStats,
  getHeaderStats,
  getTopHeaderValues,
  clearHeaderLog,
} from "./customHeaders";

const router = Router();

// GET /routewatch/headers — all header stats
router.get("/", (_req, res) => {
  res.json(getAllHeaderStats());
});

// GET /routewatch/headers/route?method=GET&path=/api/foo
router.get("/route", (req, res) => {
  const method = (req.query.method as string) ?? "GET";
  const path = (req.query.path as string) ?? "";
  if (!path) {
    return res.status(400).json({ error: "path query param required" });
  }
  const stats = getHeaderStats(method, path);
  if (!stats) {
    return res.status(404).json({ error: "no header data found for the given method and path" });
  }
  res.json(stats);
});

// GET /routewatch/headers/top?method=GET&path=/api/foo&header=content-type&limit=5
router.get("/top", (req, res) => {
  const method = (req.query.method as string) ?? "GET";
  const path = (req.query.path as string) ?? "";
  const header = (req.query.header as string) ?? "";
  const limit = parseInt((req.query.limit as string) ?? "5", 10);

  if (!path || !header) {
    return res.status(400).json({ error: "path and header query params required" });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: "limit must be a positive integer" });
  }

  res.json(getTopHeaderValues(method, path, header, limit));
});

// DELETE /routewatch/headers — clear all header logs
router.delete("/", (_req, res) => {
  clearHeaderLog();
  res.json({ cleared: true });
});

export { router as customHeadersRouter };
