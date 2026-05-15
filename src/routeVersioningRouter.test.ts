import express from "express";
import request from "supertest";
import { routeVersioningRouter } from "./routeVersioningRouter";
import { clearVersionData, setRouteVersion } from "./routeVersioning";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/routewatch", routeVersioningRouter);
  return app;
}

beforeEach(() => {
  clearVersionData();
});

describe("GET /routewatch/versions", () => {
  it("returns empty object initially", async () => {
    const res = await request(buildApp()).get("/routewatch/versions");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it("returns all versions after adding some", async () => {
    setRouteVersion("GET", "/users", "v1");
    const res = await request(buildApp()).get("/routewatch/versions");
    expect(res.body["GET:/users"]).toBe("v1");
  });
});

describe("POST /routewatch/versions", () => {
  it("sets a route version", async () => {
    const res = await request(buildApp())
      .post("/routewatch/versions")
      .send({ method: "GET", path: "/items", version: "v2" });
    expect(res.status).toBe(201);
    expect(res.body.version).toBe("v2");
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(buildApp())
      .post("/routewatch/versions")
      .send({ method: "GET" });
    expect(res.status).toBe(400);
  });
});

describe("GET /routewatch/versions/route", () => {
  it("returns version for a known route", async () => {
    setRouteVersion("POST", "/orders", "v3");
    const res = await request(buildApp()).get("/routewatch/versions/route?method=POST&path=/orders");
    expect(res.status).toBe(200);
    expect(res.body.version).toBe("v3");
  });

  it("returns 404 for unknown route", async () => {
    const res = await request(buildApp()).get("/routewatch/versions/route?method=GET&path=/nope");
    expect(res.status).toBe(404);
  });
});

describe("DELETE /routewatch/versions/route", () => {
  it("removes an existing version", async () => {
    setRouteVersion("GET", "/ping", "v1");
    const res = await request(buildApp()).delete("/routewatch/versions/route?method=GET&path=/ping");
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(true);
  });

  it("returns 404 when not found", async () => {
    const res = await request(buildApp()).delete("/routewatch/versions/route?method=GET&path=/ghost");
    expect(res.status).toBe(404);
  });
});

describe("GET /routewatch/versions/:version/routes", () => {
  it("lists routes for a version", async () => {
    setRouteVersion("GET", "/a", "v1");
    setRouteVersion("POST", "/b", "v1");
    const res = await request(buildApp()).get("/routewatch/versions/v1/routes");
    expect(res.status).toBe(200);
    expect(res.body.routes).toContain("GET:/a");
    expect(res.body.routes).toContain("POST:/b");
  });
});
