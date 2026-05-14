import express from "express";
import request from "supertest";
import { routeDependenciesRouter } from "./routeDependenciesRouter";
import { clearDependencies } from "./routeDependencies";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/routewatch/dependencies", routeDependenciesRouter);
  return app;
}

beforeEach(() => clearDependencies());

describe("GET /routewatch/dependencies", () => {
  it("returns empty array initially", async () => {
    const res = await request(buildApp()).get("/routewatch/dependencies");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /routewatch/dependencies", () => {
  it("adds a dependency and returns it", async () => {
    const res = await request(buildApp())
      .post("/routewatch/dependencies")
      .send({ fromMethod: "GET", fromPath: "/orders", toMethod: "GET", toPath: "/users", label: "lookup" });
    expect(res.status).toBe(201);
    expect(res.body.from).toBe("GET /orders");
    expect(res.body.to).toBe("GET /users");
    expect(res.body.label).toBe("lookup");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(buildApp())
      .post("/routewatch/dependencies")
      .send({ fromMethod: "GET" });
    expect(res.status).toBe(400);
  });
});

describe("GET /routewatch/dependencies/:method/*", () => {
  it("returns outgoing dependencies for a route", async () => {
    const app = buildApp();
    await request(app)
      .post("/routewatch/dependencies")
      .send({ fromMethod: "GET", fromPath: "/orders", toMethod: "GET", toPath: "/users" });
    const res = await request(app).get("/routewatch/dependencies/GET/orders");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("returns dependents when type=dependents", async () => {
    const app = buildApp();
    await request(app)
      .post("/routewatch/dependencies")
      .send({ fromMethod: "GET", fromPath: "/orders", toMethod: "GET", toPath: "/users" });
    const res = await request(app).get("/routewatch/dependencies/GET/users?type=dependents");
    expect(res.status).toBe(200);
    expect(res.body[0].from).toBe("GET /orders");
  });
});

describe("DELETE /routewatch/dependencies", () => {
  it("removes a specific dependency", async () => {
    const app = buildApp();
    await request(app)
      .post("/routewatch/dependencies")
      .send({ fromMethod: "GET", fromPath: "/orders", toMethod: "GET", toPath: "/users" });
    const res = await request(app)
      .delete("/routewatch/dependencies")
      .send({ fromMethod: "GET", fromPath: "/orders", toMethod: "GET", toPath: "/users" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 when dependency does not exist", async () => {
    const res = await request(buildApp())
      .delete("/routewatch/dependencies")
      .send({ fromMethod: "GET", fromPath: "/nope", toMethod: "POST", toPath: "/nope" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /routewatch/dependencies/all", () => {
  it("clears all dependencies", async () => {
    const app = buildApp();
    await request(app)
      .post("/routewatch/dependencies")
      .send({ fromMethod: "GET", fromPath: "/a", toMethod: "GET", toPath: "/b" });
    await request(app).delete("/routewatch/dependencies/all");
    const res = await request(app).get("/routewatch/dependencies");
    expect(res.body).toHaveLength(0);
  });
});
