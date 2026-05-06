import {
  recordIpHit,
  getIpStats,
  getAllIpStats,
  getTopIps,
  clearIpLog,
} from "./ipTracker";
import express from "express";
import request from "supertest";
import { ipTrackerRouter } from "./ipTrackerRouter";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/ip-tracker", ipTrackerRouter);
  return app;
}

beforeEach(() => clearIpLog());

describe("recordIpHit / getIpStats", () => {
  it("returns null for unknown IP", () => {
    expect(getIpStats("1.2.3.4")).toBeNull();
  });

  it("records hits and aggregates stats", () => {
    recordIpHit("1.2.3.4", "GET", "/users");
    recordIpHit("1.2.3.4", "POST", "/users");
    recordIpHit("1.2.3.4", "GET", "/users");

    const stats = getIpStats("1.2.3.4")!;
    expect(stats.totalHits).toBe(3);
    expect(stats.routes["GET /users"]).toBe(2);
    expect(stats.routes["POST /users"]).toBe(1);
    expect(stats.firstSeen).toBeLessThanOrEqual(stats.lastSeen);
  });
});

describe("getAllIpStats", () => {
  it("returns all IPs sorted by hit count descending", () => {
    recordIpHit("10.0.0.1", "GET", "/a");
    recordIpHit("10.0.0.2", "GET", "/b");
    recordIpHit("10.0.0.2", "GET", "/c");

    const all = getAllIpStats();
    expect(all[0].ip).toBe("10.0.0.2");
    expect(all[1].ip).toBe("10.0.0.1");
  });
});

describe("getTopIps", () => {
  it("limits results", () => {
    for (let i = 0; i < 5; i++) recordIpHit(`192.168.0.${i}`, "GET", "/x");
    expect(getTopIps(3)).toHaveLength(3);
  });
});

describe("ipTrackerRouter", () => {
  it("GET /ip-tracker returns all stats", async () => {
    recordIpHit("5.5.5.5", "GET", "/ping");
    const res = await request(buildApp()).get("/ip-tracker");
    expect(res.status).toBe(200);
    expect(res.body[0].ip).toBe("5.5.5.5");
  });

  it("GET /ip-tracker/top respects limit query", async () => {
    for (let i = 0; i < 5; i++) recordIpHit(`9.9.9.${i}`, "GET", "/z");
    const res = await request(buildApp()).get("/ip-tracker/top?limit=2");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("GET /ip-tracker/:ip returns 404 for unknown IP", async () => {
    const res = await request(buildApp()).get("/ip-tracker/0.0.0.0");
    expect(res.status).toBe(404);
  });

  it("DELETE /ip-tracker clears the log", async () => {
    recordIpHit("7.7.7.7", "GET", "/health");
    const res = await request(buildApp()).delete("/ip-tracker");
    expect(res.status).toBe(200);
    expect(getIpStats("7.7.7.7")).toBeNull();
  });
});
