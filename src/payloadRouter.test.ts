import express, { Express } from "express";
import request from "supertest";
import { payloadRouter } from "./payloadRouter";
import { recordPayload, clearPayloadLog, PayloadEntry } from "./payloadLogger";

function makeEntry(overrides: Partial<PayloadEntry> = {}): PayloadEntry {
  return {
    method: "GET",
    route: "/api/hello",
    requestContentType: "application/json",
    requestBodySize: 64,
    responseContentType: "application/json",
    responseBodySize: 128,
    timestamp: Date.now(),
    ...overrides,
  };
}

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/payload", payloadRouter);
  return app;
}

beforeEach(() => clearPayloadLog());

describe("GET /payload", () => {
  it("returns empty array when no entries", async () => {
    const res = await request(buildApp()).get("/payload");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns recorded entries", async () => {
    recordPayload(makeEntry());
    const res = await request(buildApp()).get("/payload");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /payload/summary", () => {
  it("returns aggregated summary", async () => {
    recordPayload(makeEntry({ method: "GET", route: "/api/hello", requestBodySize: 100, responseBodySize: 200 }));
    const res = await request(buildApp()).get("/payload/summary");
    expect(res.status).toBe(200);
    expect(res.body["GET /api/hello"]).toBeDefined();
    expect(res.body["GET /api/hello"].count).toBe(1);
  });
});

describe("GET /payload/route", () => {
  it("returns 400 if params missing", async () => {
    const res = await request(buildApp()).get("/payload/route");
    expect(res.status).toBe(400);
  });

  it("filters entries by method and path", async () => {
    recordPayload(makeEntry({ method: "POST", route: "/api/create" }));
    recordPayload(makeEntry({ method: "GET", route: "/api/hello" }));

    const res = await request(buildApp()).get("/payload/route?method=POST&path=/api/create");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].method).toBe("POST");
  });
});

describe("DELETE /payload", () => {
  it("clears the log", async () => {
    recordPayload(makeEntry());
    const res = await request(buildApp()).delete("/payload");
    expect(res.status).toBe(200);
    expect(res.body.cleared).toBe(true);

    const check = await request(buildApp()).get("/payload");
    expect(check.body).toHaveLength(0);
  });
});
