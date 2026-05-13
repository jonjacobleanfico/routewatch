import { Router, Request, Response } from "express";
import {
  setAlias,
  getAlias,
  removeAlias,
  resolveAlias,
  getAllAliases,
  clearAliases,
} from "./routeAlias";

const router = Router();

// GET /routewatch/aliases — list all aliases
router.get("/", (_req: Request, res: Response) => {
  res.json(getAllAliases());
});

// POST /routewatch/aliases — set an alias
// body: { method, path, alias }
router.post("/", (req: Request, res: Response) => {
  const { method, path: routePath, alias } = req.body;
  if (!method || !routePath || !alias) {
    return res.status(400).json({ error: "method, path, and alias are required" });
  }
  try {
    setAlias(method, routePath, alias);
    res.status(201).json({ key: `${method.toUpperCase()} ${routePath}`, alias });
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

// GET /routewatch/aliases/resolve/:alias — resolve alias to route key
router.get("/resolve/:alias", (req: Request, res: Response) => {
  const key = resolveAlias(req.params.alias);
  if (!key) return res.status(404).json({ error: "Alias not found" });
  res.json({ alias: req.params.alias, key });
});

// GET /routewatch/aliases/:method/:path — get alias for a route
router.get("/:method/*", (req: Request, res: Response) => {
  const method = req.params.method;
  const routePath = "/" + (req.params as any)[0];
  const alias = getAlias(method, routePath);
  if (!alias) return res.status(404).json({ error: "No alias set for this route" });
  res.json({ key: `${method.toUpperCase()} ${routePath}`, alias });
});

// DELETE /routewatch/aliases/:method/:path — remove alias
router.delete("/:method/*", (req: Request, res: Response) => {
  const method = req.params.method;
  const routePath = "/" + (req.params as any)[0];
  const removed = removeAlias(method, routePath);
  if (!removed) return res.status(404).json({ error: "No alias found for this route" });
  res.json({ removed: true });
});

// DELETE /routewatch/aliases — clear all aliases
router.delete("/", (_req: Request, res: Response) => {
  clearAliases();
  res.json({ cleared: true });
});

export { router as routeAliasRouter };
