import { Router } from "express";
import {
  setLatencyBudget,
  removeLatencyBudget,
  getLatencyBudget,
  getAllLatencyBudgets,
  evaluateLatencyBudget,
  getLatencyBudgetViolations,
  clearLatencyBudgets,
} from "./routeLatencyBudget";

export const latencyBudgetRouter = Router();

latencyBudgetRouter.get("/", (_req, res) => {
  res.json(getAllLatencyBudgets());
});

latencyBudgetRouter.get("/violations", (_req, res) => {
  res.json(getLatencyBudgetViolations());
});

latencyBudgetRouter.get("/:method/:route", (req, res) => {
  const { method, route } = req.params;
  const budget = getLatencyBudget(method.toUpperCase(), decodeURIComponent(route));
  if (!budget) {
    return res.status(404).json({ error: "No latency budget found for this route" });
  }
  res.json(budget);
});

latencyBudgetRouter.post("/:method/:route", (req, res) => {
  const { method, route } = req.params;
  const { budgetMs, warnAt } = req.body;
  if (typeof budgetMs !== "number" || budgetMs <= 0) {
    return res.status(400).json({ error: "budgetMs must be a positive number" });
  }
  setLatencyBudget(method.toUpperCase(), decodeURIComponent(route), { budgetMs, warnAt });
  res.status(201).json({ ok: true });
});

latencyBudgetRouter.post("/evaluate/:method/:route", (req, res) => {
  const { method, route } = req.params;
  const { durationMs } = req.body;
  if (typeof durationMs !== "number") {
    return res.status(400).json({ error: "durationMs must be a number" });
  }
  const result = evaluateLatencyBudget(method.toUpperCase(), decodeURIComponent(route), durationMs);
  res.json(result ?? { status: "no_budget" });
});

latencyBudgetRouter.delete("/", (_req, res) => {
  clearLatencyBudgets();
  res.json({ ok: true });
});

latencyBudgetRouter.delete("/:method/:route", (req, res) => {
  const { method, route } = req.params;
  removeLatencyBudget(method.toUpperCase(), decodeURIComponent(route));
  res.json({ ok: true });
});
