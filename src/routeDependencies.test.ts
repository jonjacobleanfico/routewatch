import {
  addDependency,
  removeDependency,
  getDependencies,
  getDependents,
  getAllDependencies,
  clearDependencies,
  routeKey,
} from "./routeDependencies";

beforeEach(() => clearDependencies());

describe("routeKey", () => {
  it("normalizes method to uppercase", () => {
    expect(routeKey("get", "/users")).toBe("GET /users");
  });
});

describe("addDependency", () => {
  it("records a dependency between two routes", () => {
    const dep = addDependency("GET", "/orders", "GET", "/users", "fetches user");
    expect(dep.from).toBe("GET /orders");
    expect(dep.to).toBe("GET /users");
    expect(dep.label).toBe("fetches user");
    expect(dep.addedAt).toBeDefined();
  });

  it("overwrites an existing dependency with the same from/to", () => {
    addDependency("GET", "/orders", "GET", "/users", "old label");
    addDependency("GET", "/orders", "GET", "/users", "new label");
    const deps = getDependencies("GET", "/orders");
    expect(deps).toHaveLength(1);
    expect(deps[0].label).toBe("new label");
  });
});

describe("removeDependency", () => {
  it("removes an existing dependency", () => {
    addDependency("GET", "/orders", "GET", "/users");
    const removed = removeDependency("GET", "/orders", "GET", "/users");
    expect(removed).toBe(true);
    expect(getDependencies("GET", "/orders")).toHaveLength(0);
  });

  it("returns false if dependency does not exist", () => {
    expect(removeDependency("GET", "/nope", "POST", "/nope")).toBe(false);
  });
});

describe("getDependencies", () => {
  it("returns all outgoing dependencies for a route", () => {
    addDependency("GET", "/orders", "GET", "/users");
    addDependency("GET", "/orders", "GET", "/products");
    expect(getDependencies("GET", "/orders")).toHaveLength(2);
  });

  it("returns empty array for unknown route", () => {
    expect(getDependencies("GET", "/unknown")).toEqual([]);
  });
});

describe("getDependents", () => {
  it("returns routes that depend on a given route", () => {
    addDependency("GET", "/orders", "GET", "/users");
    addDependency("POST", "/invoices", "GET", "/users");
    const dependents = getDependents("GET", "/users");
    expect(dependents).toHaveLength(2);
    expect(dependents.map((d) => d.from)).toContain("GET /orders");
    expect(dependents.map((d) => d.from)).toContain("POST /invoices");
  });
});

describe("getAllDependencies", () => {
  it("returns all recorded dependencies", () => {
    addDependency("GET", "/a", "GET", "/b");
    addDependency("POST", "/c", "GET", "/d");
    expect(getAllDependencies()).toHaveLength(2);
  });
});

describe("clearDependencies", () => {
  it("removes all dependencies", () => {
    addDependency("GET", "/a", "GET", "/b");
    clearDependencies();
    expect(getAllDependencies()).toHaveLength(0);
  });
});
