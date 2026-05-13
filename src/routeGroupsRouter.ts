import { Router } from "express";
import {
  addRouteToGroup,
  removeRouteFromGroup,
  getRoutesInGroup,
  getGroupForRoute,
  getAllGroups,
  deleteGroup,
  clearAllGroups,
} from "./routeGroups";

export const routeGroupsRouter = Router();

// GET /routewatch/groups — list all groups
routeGroupsRouter.get("/", (_req, res) => {
  res.json({ groups: getAllGroups() });
});

// GET /routewatch/groups/:group — list routes in a group
routeGroupsRouter.get("/:group", (req, res) => {
  const routes = getRoutesInGroup(req.params.group);
  res.json({ group: req.params.group, routes });
});

// POST /routewatch/groups/:group — add a route to a group
routeGroupsRouter.post("/:group", (req, res) => {
  const { method, path } = req.body;
  if (!method || !path) {
    return res.status(400).json({ error: "method and path are required" });
  }
  addRouteToGroup(req.params.group, method, path);
  res.json({ ok: true, group: req.params.group, method, path });
});

// DELETE /routewatch/groups/:group/route — remove a route from a group
routeGroupsRouter.delete("/:group/route", (req, res) => {
  const { method, path } = req.body;
  if (!method || !path) {
    return res.status(400).json({ error: "method and path are required" });
  }
  removeRouteFromGroup(req.params.group, method, path);
  res.json({ ok: true });
});

// DELETE /routewatch/groups/:group — delete an entire group
routeGroupsRouter.delete("/:group", (req, res) => {
  deleteGroup(req.params.group);
  res.json({ ok: true });
});

// GET /routewatch/groups/resolve?method=GET&path=/foo
routeGroupsRouter.get("/resolve/route", (req, res) => {
  const { method, path } = req.query as { method?: string; path?: string };
  if (!method || !path) {
    return res.status(400).json({ error: "method and path query params are required" });
  }
  const group = getGroupForRoute(method, path);
  res.json({ method, path, group: group ?? null });
});

// POST /routewatch/groups/clear — clear all groups
routeGroupsRouter.post("/clear", (_req, res) => {
  clearAllGroups();
  res.json({ ok: true });
});
