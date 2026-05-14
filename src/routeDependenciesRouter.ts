import { Router, Request, Response } from "express";
import {
  addDependency,
  removeDependency,
  getDependencies,
  getDependents,
  getAllDependencies,
  clearDependencies,
} from "./routeDependencies";

const router = Router();

// GET /routewatch/dependencies — list all dependencies
router.get("/", (_req: Request, res: Response) => {
  res.json(getAllDependencies());
});

// POST /routewatch/dependencies — add a dependency
router.post("/", (req: Request, res: Response) => {
  const { fromMethod, fromPath, toMethod, toPath, label } = req.body;
  if (!fromMethod || !fromPath || !toMethod || !toPath) {
    return res.status(400).json({ error: "fromMethod, fromPath, toMethod, toPath are required" });
  }
  const dep = addDependency(fromMethod, fromPath, toMethod, toPath, label);
  res.status(201).json(dep);
});

// GET /routewatch/dependencies/:method/:path/outgoing
router.get("/:method/*", (req: Request, res: Response) => {
  const method = req.params.method;
  const path = "/" + req.params[0];
  const type = req.query.type as string;
  if (type === "dependents") {
    return res.json(getDependents(method, path));
  }
  res.json(getDependencies(method, path));
});

// DELETE /routewatch/dependencies — remove a specific dependency
router.delete("/", (req: Request, res: Response) => {
  const { fromMethod, fromPath, toMethod, toPath } = req.body;
  if (!fromMethod || !fromPath || !toMethod || !toPath) {
    return res.status(400).json({ error: "fromMethod, fromPath, toMethod, toPath are required" });
  }
  const removed = removeDependency(fromMethod, fromPath, toMethod, toPath);
  if (!removed) return res.status(404).json({ error: "Dependency not found" });
  res.json({ success: true });
});

// DELETE /routewatch/dependencies/all
router.delete("/all", (_req: Request, res: Response) => {
  clearDependencies();
  res.json({ success: true });
});

export { router as routeDependenciesRouter };
