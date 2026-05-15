import express, { Express } from "express";
import request from "supertest";
import { mockRouter } from "./mockRouter";
import { mockMiddleware } from "./mockMiddleware";
import { clearMocks, setMock } from "./routeMock";

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(mockMiddleware());
  app.use("/__mocks", mockRouter);
  app.get("/real", (_req, res) => res.json({ real: true }));
  return app;
}

beforeEach(() => clearMocks());

describe("GET /__mocks", () => {
  it("returns empty list initially", async () => {
    const res = await request(buildApp()).get("/__mocks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /__mocks", () => {
  it("creates a mock", async () => {
    const res = await request(buildApp()).post("/__mocks").send({
      method: "GET",
      path: "/users",
      response: { status: 200, body: [{ id: 1 }] },
    });
    expect(res.status).toBe(201);
    expect(res.body.path).toBe("/users");
  });

  it("rejects missing fields", async () => {
    const res = await request(buildApp()).post("/__mocks").send({ method: "GET" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /__mocks/:method/:path", () => {
  it("deletes an existing mock", async () => {
    const app = buildApp();
    setMock("GET", "/bye", { status: 200, body: {} });
    const res = await request(app).delete("/__mocks/GET/bye");
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(true);
  });

  it("returns 404 for unknown mock", async () => {
    const res = await request(buildApp()).delete("/__mocks/GET/unknown");
    expect(res.status).toBe(404);
  });
});

describe("mockMiddleware", () => {
  it("intercepts request and returns mock response", async () => {
    const app = buildApp();
    setMock("GET", "/real", { status: 418, body: { mocked: true } });
    const res = await request(app).get("/real");
    expect(res.status).toBe(418);
    expect(res.body.mocked).toBe(true);
  });

  it("passes through when no mock is registered", async () => {
    const res = await request(buildApp()).get("/real");
    expect(res.status).toBe(200);
    expect(res.body.real).toBe(true);
  });

  it("passes through when mock is disabled", async () => {
    const app = buildApp();
    setMock("GET", "/real", { status: 418, body: {} });
    await request(app).patch("/__mocks/GET/real/disable");
    const res = await request(app).get("/real");
    expect(res.status).toBe(200);
  });
});
