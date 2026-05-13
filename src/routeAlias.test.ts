import express from "express";
import request from "supertest";
import {
  setAlias,
  getAlias,
  removeAlias,
  resolveAlias,
  getAllAliases,
  clearAliases,
  routeKey,
} from "./routeAlias";
import { routeAliasRouter } from "./routeAliasRouter";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/routewatch/aliases", routeAliasRouter);
  return app;
}

beforeEach(() => clearAliases());

describe("routeAlias core", () => {
  test("routeKey formats correctly", () => {
    expect(routeKey("get", "/users")).toBe("GET /users");
  });

  test("setAlias and getAlias", () => {
    setAlias("GET", "/users", "List Users");
    expect(getAlias("GET", "/users")).toBe("List Users");
  });

  test("getAlias returns undefined for unknown route", () => {
    expect(getAlias("GET", "/unknown")).toBeUndefined();
  });

  test("resolveAlias returns route key", () => {
    setAlias("POST", "/orders", "Create Order");
    expect(resolveAlias("Create Order")).toBe("POST /orders");
  });

  test("removeAlias removes entry", () => {
    setAlias("DELETE", "/items", "Delete Item");
    expect(removeAlias("DELETE", "/items")).toBe(true);
    expect(getAlias("DELETE", "/items")).toBeUndefined();
    expect(resolveAlias("Delete Item")).toBeUndefined();
  });

  test("removeAlias returns false if not found", () => {
    expect(removeAlias("GET", "/nope")).toBe(false);
  });

  test("duplicate alias on different route throws", () => {
    setAlias("GET", "/a", "MyAlias");
    expect(() => setAlias("GET", "/b", "MyAlias")).toThrow();
  });

  test("getAllAliases returns all entries", () => {
    setAlias("GET", "/users", "List Users");
    setAlias("POST", "/users", "Create User");
    const all = getAllAliases();
    expect(all["GET /users"]).toBe("List Users");
    expect(all["POST /users"]).toBe("Create User");
  });
});

describe("routeAliasRouter", () => {
  test("POST /routewatch/aliases sets alias", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/routewatch/aliases")
      .send({ method: "GET", path: "/products", alias: "List Products" });
    expect(res.status).toBe(201);
    expect(res.body.alias).toBe("List Products");
  });

  test("GET /routewatch/aliases lists all", async () => {
    setAlias("GET", "/ping", "Health Check");
    const app = buildApp();
    const res = await request(app).get("/routewatch/aliases");
    expect(res.status).toBe(200);
    expect(res.body["GET /ping"]).toBe("Health Check");
  });

  test("GET /routewatch/aliases/resolve/:alias resolves alias", async () => {
    setAlias("GET", "/status", "Status Check");
    const app = buildApp();
    const res = await request(app).get("/routewatch/aliases/resolve/Status Check");
    expect(res.status).toBe(200);
    expect(res.body.key).toBe("GET /status");
  });

  test("DELETE /routewatch/aliases clears all", async () => {
    setAlias("GET", "/x", "X Route");
    const app = buildApp();
    const res = await request(app).delete("/routewatch/aliases");
    expect(res.status).toBe(200);
    expect(getAllAliases()).toEqual({});
  });
});
