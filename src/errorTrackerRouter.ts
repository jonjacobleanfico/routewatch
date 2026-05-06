import { Router } from "express";
import {
  getErrorLog,
  getErrorsByRoute,
  getErrorSummary,
  clearErrorLog,
} from "./errorTracker";

const router = Router();

router.get("/errors", (_req, res) => {
  res.json(getErrorLog());
});

router.get("/errors/summary", (_req, res) => {
  res.json(getErrorSummary());
});

router.get("/errors/route", (req, res) => {
  const { method, path } = req.query as {
    method?: string;
    path?: string;
  };
  if (!method || !path) {
    res.status(400).json({ error: "method and path query params required" });
    return;
  }
  res.json(getErrorsByRoute(method, path));
});

router.delete("/errors", (_req, res) => {
  clearErrorLog();
  res.json({ ok: true });
});

export { router as errorTrackerRouter };
