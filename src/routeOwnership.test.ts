import express from "express";
import request from "supertest";
import {
  setOwner,
  getOwner,
  removeOwner,
  getAllOwners,
  getRoutesByOwner,
  clearOwnership,
} from "./routeOwnership";
import router from "./routeOwnershipRouter";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/ownership", router);
  return app;
}

beforeEach(() => {
  clearOwnership();
});

describe("routeOwnership core", () => {
  it("sets and gets an owner", () => {
    setOwner("GET", "/users", "alice", "alice@example.com");
    const entry = getOwner("GET", "/users");
    expect(entry).toBeDefined();
    expect(entry!.owner).toBe("alice");
    expect(entry!.contact).toBe("alice@example.com");
    expect(entry!.assignedAt).toBeGreaterThan(0);
  });

  it("returns undefined for unknown route", () => {
    expect(getOwner("GET", "/unknown")).toBeUndefined();
  });

  it("removes an owner", () => {
    setOwner("POST", "/items", "bob");
    expect(removeOwner("POST", "/items")).toBe(true);
    expect(getOwner("POST", "/items")).toBeUndefined();
  });

  it("returns false when removing non-existent owner", () => {
    expect(removeOwner("DELETE", "/nope")).toBe(false);
  });

  it("gets routes by owner", () => {
    setOwner("GET", "/users", "alice");
    setOwner("POST", "/users", "alice");
    setOwner("GET", "/orders", "bob");
    const aliceRoutes = getRoutesByOwner("alice");
    expect(aliceRoutes).toHaveLength(2);
    expect(aliceRoutes).toContain("GET:/users");
    expect(aliceRoutes).toContain("POST:/users");
  });

  it("getAllOwners returns all entries", () => {
    setOwner("GET", "/a", "teamA");
    setOwner("GET", "/b", "teamB");
    const all = getAllOwners();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe("routeOwnershipRouter", () => {
  it("POST /ownership assigns an owner", async () => {
    const res = await request(buildApp())
      .post("/ownership")
      .send({ method: "GET", path: "/products", owner: "carol", contact: "carol@co.com" });
    expect(res.status).toBe(201);
    expect(res.body.owner).toBe("carol");
  });

  it("POST /ownership returns 400 if missing fields", async () => {
    const res = await request(buildApp()).post("/ownership").send({ method: "GET" });
    expect(res.status).toBe(400);
  });

  it("GET /ownership returns all owners", async () => {
    setOwner("GET", "/x", "teamX");
    const res = await request(buildApp()).get("/ownership");
    expect(res.status).toBe(200);
    expect(res.body["GET:/x"]).toBeDefined();
  });

  it("GET /ownership/by-owner/:owner returns routes", async () => {
    setOwner("GET", "/y", "dave");
    const res = await request(buildApp()).get("/ownership/by-owner/dave");
    expect(res.status).toBe(200);
    expect(res.body.routes).toContain("GET:/y");
  });
});
