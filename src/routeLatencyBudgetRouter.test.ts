import express from "express";
import request from "supertest";
import {
  setLatencyBudget,
  clearLatencyBudgets,
  recordLatencyObservation,
} from "./routeLatencyBudget";
import { latencyBudgetRouter } from "./routeLatencyBudgetRouter";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/latency-budgets", latencyBudgetRouter);
  return app;
}

beforeEach(() => {
  clearLatencyBudgets();
});

describe("GET /latency-budgets", () => {
  it("returns empty object when no budgets set", async () => {
    const res = await request(buildApp()).get("/latency-budgets");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it("returns all set budgets", async () => {
    setLatencyBudget("GET", "/api/users", { budgetMs: 200 });
    const res = await request(buildApp()).get("/latency-budgets");
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).length).toBe(1);
  });
});

describe("GET /latency-budgets/:method/:route", () => {
  it("returns 404 when budget not found", async () => {
    const res = await request(buildApp()).get("/latency-budgets/GET/%2Fapi%2Fusers");
    expect(res.status).toBe(404);
  });

  it("returns budget when found", async () => {
    setLatencyBudget("GET", "/api/users", { budgetMs: 300, warnAt: 200 });
    const res = await request(buildApp()).get("/latency-budgets/GET/%2Fapi%2Fusers");
    expect(res.status).toBe(200);
    expect(res.body.budgetMs).toBe(300);
    expect(res.body.warnAt).toBe(200);
  });
});

describe("POST /latency-budgets/:method/:route", () => {
  it("returns 400 if budgetMs is missing", async () => {
    const res = await request(buildApp())
      .post("/latency-budgets/GET/%2Fapi%2Fusers")
      .send({});
    expect(res.status).toBe(400);
  });

  it("creates a budget", async () => {
    const res = await request(buildApp())
      .post("/latency-budgets/POST/%2Fapi%2Fitems")
      .send({ budgetMs: 150 });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });
});

describe("POST /latency-budgets/evaluate/:method/:route", () => {
  it("returns no_budget when no budget configured", async () => {
    const res = await request(buildApp())
      .post("/latency-budgets/evaluate/GET/%2Fapi%2Fusers")
      .send({ durationMs: 100 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("no_budget");
  });

  it("returns evaluation result when budget exists", async () => {
    setLatencyBudget("GET", "/api/users", { budgetMs: 200 });
    const res = await request(buildApp())
      .post("/latency-budgets/evaluate/GET/%2Fapi%2Fusers")
      .send({ durationMs: 250 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status");
  });
});

describe("DELETE /latency-budgets", () => {
  it("clears all budgets", async () => {
    setLatencyBudget("GET", "/api/users", { budgetMs: 200 });
    const res = await request(buildApp()).delete("/latency-budgets");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("DELETE /latency-budgets/:method/:route", () => {
  it("removes a specific budget", async () => {
    setLatencyBudget("GET", "/api/users", { budgetMs: 200 });
    const res = await request(buildApp()).delete("/latency-budgets/GET/%2Fapi%2Fusers");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
