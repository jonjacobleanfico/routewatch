import express from "express";
import request from "supertest";
import { errorTrackerRouter } from "./errorTrackerRouter";
import { recordError, clearErrorLog } from "./errorTracker";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/__routewatch", errorTrackerRouter);
  return app;
}

function makeHit(
  method = "GET",
  path = "/api/test",
  statusCode = 500
) {
  return { method, path, statusCode, message: "err", timestamp: Date.now() };
}

beforeEach(() => clearErrorLog());

describe("GET /__routewatch/errors", () => {
  it("returns empty array when no errors recorded", async () => {
    const res = await request(buildApp()).get("/__routewatch/errors");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns recorded errors", async () => {
    recordError(makeHit());
    const res = await request(buildApp()).get("/__routewatch/errors");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /__routewatch/errors/summary", () => {
  it("returns a summary count per route", async () => {
    recordError(makeHit("GET", "/api/foo"));
    recordError(makeHit("GET", "/api/foo"));
    const res = await request(buildApp()).get("/__routewatch/errors/summary");
    expect(res.status).toBe(200);
    expect(res.body["GET /api/foo"]).toBe(2);
  });
});

describe("GET /__routewatch/errors/route", () => {
  it("returns 400 when query params missing", async () => {
    const res = await request(buildApp()).get("/__routewatch/errors/route");
    expect(res.status).toBe(400);
  });

  it("returns errors for a specific route", async () => {
    recordError(makeHit("POST", "/api/login", 401));
    recordError(makeHit("GET", "/api/other"));
    const res = await request(buildApp()).get(
      "/__routewatch/errors/route?method=POST&path=/api/login"
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].statusCode).toBe(401);
  });
});

describe("DELETE /__routewatch/errors", () => {
  it("clears the error log", async () => {
    recordError(makeHit());
    const del = await request(buildApp()).delete("/__routewatch/errors");
    expect(del.status).toBe(200);
    const res = await request(buildApp()).get("/__routewatch/errors");
    expect(res.body).toHaveLength(0);
  });
});
