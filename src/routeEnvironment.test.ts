import {
  setRouteEnvironment,
  addRouteEnvironment,
  removeRouteEnvironment,
  getRouteEnvironments,
  getRoutesByEnvironment,
  getAllRouteEnvironments,
  clearRouteEnvironments,
} from "./routeEnvironment";

beforeEach(() => {
  clearRouteEnvironments();
});

describe("setRouteEnvironment", () => {
  it("sets environments for a route", () => {
    setRouteEnvironment("GET", "/users", ["production", "staging"]);
    expect(getRouteEnvironments("GET", "/users")).toEqual(
      expect.arrayContaining(["production", "staging"])
    );
  });

  it("overwrites existing environments", () => {
    setRouteEnvironment("GET", "/users", ["production"]);
    setRouteEnvironment("GET", "/users", ["staging"]);
    expect(getRouteEnvironments("GET", "/users")).toEqual(["staging"]);
  });
});

describe("addRouteEnvironment", () => {
  it("adds an environment to an existing route", () => {
    setRouteEnvironment("POST", "/orders", ["production"]);
    addRouteEnvironment("POST", "/orders", "staging");
    const envs = getRouteEnvironments("POST", "/orders");
    expect(envs).toContain("production");
    expect(envs).toContain("staging");
  });

  it("creates the entry if route does not exist", () => {
    addRouteEnvironment("DELETE", "/items", "dev");
    expect(getRouteEnvironments("DELETE", "/items")).toEqual(["dev"]);
  });

  it("does not duplicate environments", () => {
    addRouteEnvironment("GET", "/ping", "production");
    addRouteEnvironment("GET", "/ping", "production");
    expect(getRouteEnvironments("GET", "/ping").length).toBe(1);
  });
});

describe("removeRouteEnvironment", () => {
  it("removes a specific environment from a route", () => {
    setRouteEnvironment("GET", "/health", ["production", "staging"]);
    removeRouteEnvironment("GET", "/health", "staging");
    expect(getRouteEnvironments("GET", "/health")).toEqual(["production"]);
  });

  it("does nothing if route does not exist", () => {
    expect(() =>
      removeRouteEnvironment("GET", "/nonexistent", "production")
    ).not.toThrow();
  });
});

describe("getRoutesByEnvironment", () => {
  it("returns routes tagged with a given environment", () => {
    setRouteEnvironment("GET", "/users", ["production"]);
    setRouteEnvironment("POST", "/users", ["staging"]);
    setRouteEnvironment("GET", "/orders", ["production", "staging"]);

    const prodRoutes = getRoutesByEnvironment("production");
    expect(prodRoutes).toEqual(
      expect.arrayContaining([
        { method: "GET", path: "/users" },
        { method: "GET", path: "/orders" },
      ])
    );
    expect(prodRoutes.find((r) => r.path === "/users" && r.method === "POST")).toBeUndefined();
  });
});

describe("getAllRouteEnvironments", () => {
  it("returns all route environment mappings", () => {
    setRouteEnvironment("GET", "/a", ["production"]);
    setRouteEnvironment("POST", "/b", ["staging", "dev"]);
    const all = getAllRouteEnvironments();
    expect(all["GET:/a"]).toEqual(["production"]);
    expect(all["POST:/b"]).toEqual(expect.arrayContaining(["staging", "dev"]));
  });

  it("returns empty object when no routes are registered", () => {
    expect(getAllRouteEnvironments()).toEqual({});
  });
});
