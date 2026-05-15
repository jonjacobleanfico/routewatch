import { Router, Request, Response } from "express";
import {
  computeFingerprint,
  setRouteFingerprint,
  getRouteFingerprint,
  getAllFingerprints,
  removeRouteFingerprint,
  clearFingerprints,
  detectFingerprintChange,
} from "./routeFingerprint";

export const routeFingerprintRouter = Router();

// GET /fingerprints — list all stored fingerprints
routeFingerprintRouter.get("/", (_req: Request, res: Response) => {
  res.json(getAllFingerprints());
});

// GET /fingerprints/:method/:path — get fingerprint for a specific route
routeFingerprintRouter.get("/:method/*", (req: Request, res: Response) => {
  const method = req.params.method.toUpperCase();
  const path = "/" + (req.params as Record<string, string>)["0"];
  const entry = getRouteFingerprint(method, path);
  if (!entry) {
    return res.status(404).json({ error: "No fingerprint found for route" });
  }
  res.json(entry);
});

// POST /fingerprints/compute — compute a fingerprint from method, path, metadata
routeFingerprintRouter.post("/compute", (req: Request, res: Response) => {
  const { method, path, metadata } = req.body as {
    method?: string;
    path?: string;
    metadata?: Record<string, unknown>;
  };
  if (!method || !path) {
    return res.status(400).json({ error: "method and path are required" });
  }
  const fingerprint = computeFingerprint(method.toUpperCase(), path, metadata ?? {});
  res.json({ method: method.toUpperCase(), path, fingerprint });
});

// POST /fingerprints/set — store a fingerprint for a route
routeFingerprintRouter.post("/set", (req: Request, res: Response) => {
  const { method, path, fingerprint } = req.body as {
    method?: string;
    path?: string;
    fingerprint?: string;
  };
  if (!method || !path || !fingerprint) {
    return res.status(400).json({ error: "method, path, and fingerprint are required" });
  }
  setRouteFingerprint(method.toUpperCase(), path, fingerprint);
  res.json({ ok: true });
});

// POST /fingerprints/detect-change — check if a fingerprint differs from stored
routeFingerprintRouter.post("/detect-change", (req: Request, res: Response) => {
  const { method, path, fingerprint } = req.body as {
    method?: string;
    path?: string;
    fingerprint?: string;
  };
  if (!method || !path || !fingerprint) {
    return res.status(400).json({ error: "method, path, and fingerprint are required" });
  }
  const result = detectFingerprintChange(method.toUpperCase(), path, fingerprint);
  res.json(result);
});

// DELETE /fingerprints/:method/:path — remove a specific fingerprint
routeFingerprintRouter.delete("/:method/*", (req: Request, res: Response) => {
  const method = req.params.method.toUpperCase();
  const path = "/" + (req.params as Record<string, string>)["0"];
  removeRouteFingerprint(method, path);
  res.json({ ok: true });
});

// DELETE /fingerprints — clear all fingerprints
routeFingerprintRouter.delete("/", (_req: Request, res: Response) => {
  clearFingerprints();
  res.json({ ok: true });
});
