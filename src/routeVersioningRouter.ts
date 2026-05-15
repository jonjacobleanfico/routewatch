import { Router } from "express";
import {
  setRouteVersion,
  getRouteVersion,
  removeRouteVersion,
  getAllVersions,
  getHitsByVersion,
  getRoutesForVersion,
  clearVersionData,
} from "./routeVersioning";

const router = Router();

router.get("/versions", (_req, res) => {
  res.json(getAllVersions());
});

router.get("/versions/hits", (_req, res) => {
  res.json(getHitsByVersion());
});

router.get("/versions/:version/routes", (req, res) => {
  const routes = getRoutesForVersion(req.params.version);
  res.json({ version: req.params.version, routes });
});

router.post("/versions", (req, res) => {
  const { method, path: routePath, version } = req.body;
  if (!method || !routePath || !version) {
    return res.status(400).json({ error: "method, path, and version are required" });
  }
  setRouteVersion(method, routePath, version);
  res.status(201).json({ method, path: routePath, version });
});

router.get("/versions/route", (req, res) => {
  const { method, path: routePath } = req.query as Record<string, string>;
  if (!method || !routePath) {
    return res.status(400).json({ error: "method and path query params are required" });
  }
  const version = getRouteVersion(method, routePath);
  if (!version) {
    return res.status(404).json({ error: "No version found for route" });
  }
  res.json({ method, path: routePath, version });
});

router.delete("/versions/route", (req, res) => {
  const { method, path: routePath } = req.query as Record<string, string>;
  if (!method || !routePath) {
    return res.status(400).json({ error: "method and path query params are required" });
  }
  const removed = removeRouteVersion(method, routePath);
  if (!removed) {
    return res.status(404).json({ error: "Route version not found" });
  }
  res.json({ removed: true });
});

router.post("/versions/clear", (_req, res) => {
  clearVersionData();
  res.json({ cleared: true });
});

export { router as routeVersioningRouter };
