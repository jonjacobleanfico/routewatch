import { Router } from "express";
import {
  setOwner,
  getOwner,
  removeOwner,
  getAllOwners,
  getRoutesByOwner,
  clearOwnership,
} from "./routeOwnership";

const router = Router();

// GET /ownership — list all route owners
router.get("/", (_req, res) => {
  res.json(getAllOwners());
});

// GET /ownership/by-owner/:owner — get routes for a specific owner
router.get("/by-owner/:owner", (req, res) => {
  const routes = getRoutesByOwner(req.params.owner);
  res.json({ owner: req.params.owner, routes });
});

// GET /ownership/:method/:path — get owner for a specific route
router.get("/:method/*", (req, res) => {
  const method = req.params.method;
  const path = "/" + (req.params as Record<string, string>)["0"];
  const entry = getOwner(method, path);
  if (!entry) {
    return res.status(404).json({ error: "No owner found for this route" });
  }
  res.json(entry);
});

// POST /ownership — assign an owner
router.post("/", (req, res) => {
  const { method, path, owner, contact } = req.body;
  if (!method || !path || !owner) {
    return res.status(400).json({ error: "method, path, and owner are required" });
  }
  setOwner(method, path, owner, contact);
  res.status(201).json({ message: "Owner assigned", method, path, owner, contact });
});

// DELETE /ownership/:method/:path — remove owner
router.delete("/:method/*", (req, res) => {
  const method = req.params.method;
  const path = "/" + (req.params as Record<string, string>)["0"];
  const removed = removeOwner(method, path);
  if (!removed) {
    return res.status(404).json({ error: "No owner found for this route" });
  }
  res.json({ message: "Owner removed", method, path });
});

// DELETE /ownership — clear all
router.delete("/", (_req, res) => {
  clearOwnership();
  res.json({ message: "All ownership records cleared" });
});

export default router;
