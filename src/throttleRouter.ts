import { Router, Request, Response } from "express";
import {
  setThrottleRule,
  removeThrottleRule,
  getThrottleRule,
  getAllThrottleRules,
  clearAllThrottleRules,
} from "./routeThrottle";

const router = Router();

// GET /routewatch/throttle — list all throttle rules
router.get("/", (_req: Request, res: Response) => {
  res.json(getAllThrottleRules());
});

// POST /routewatch/throttle — set a throttle rule
router.post("/", (req: Request, res: Response) => {
  const { method, path, maxRequests, windowMs } = req.body;
  if (!method || !path || typeof maxRequests !== "number" || typeof windowMs !== "number") {
    return res.status(400).json({ error: "method, path, maxRequests, and windowMs are required" });
  }
  if (maxRequests <= 0 || windowMs <= 0) {
    return res.status(400).json({ error: "maxRequests and windowMs must be positive numbers" });
  }
  setThrottleRule(method, path, { maxRequests, windowMs });
  res.status(201).json({ message: "Throttle rule set", method, path, maxRequests, windowMs });
});

// GET /routewatch/throttle/:method/:path — get rule for a specific route
router.get("/:method/*", (req: Request, res: Response) => {
  const method = req.params.method;
  const path = "/" + (req.params as Record<string, string>)["0"];
  const rule = getThrottleRule(method, path);
  if (!rule) return res.status(404).json({ error: "No throttle rule found" });
  res.json({ method, path, ...rule });
});

// DELETE /routewatch/throttle/:method/:path — remove rule
router.delete("/:method/*", (req: Request, res: Response) => {
  const method = req.params.method;
  const path = "/" + (req.params as Record<string, string>)["0"];
  removeThrottleRule(method, path);
  res.json({ message: "Throttle rule removed", method, path });
});

// DELETE /routewatch/throttle — clear all rules
router.delete("/", (_req: Request, res: Response) => {
  clearAllThrottleRules();
  res.json({ message: "All throttle rules cleared" });
});

export default router;
