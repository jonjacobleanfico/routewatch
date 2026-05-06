import { Router } from "express";
import { getAllIpStats, getIpStats, getTopIps, clearIpLog } from "./ipTracker";

export const ipTrackerRouter = Router();

ipTrackerRouter.get("/", (_req, res) => {
  res.json(getAllIpStats());
});

ipTrackerRouter.get("/top", (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "10", 10);
  res.json(getTopIps(isNaN(limit) ? 10 : limit));
});

ipTrackerRouter.get("/:ip", (req, res) => {
  const stats = getIpStats(req.params.ip);
  if (!stats) {
    res.status(404).json({ error: "IP not found" });
    return;
  }
  res.json(stats);
});

ipTrackerRouter.delete("/", (_req, res) => {
  clearIpLog();
  res.json({ message: "IP log cleared" });
});
