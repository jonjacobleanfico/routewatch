import {
  setRouteVersion,
  getRouteVersion,
  removeRouteVersion,
  getAllVersions,
  recordVersionHit,
  getHitsByVersion,
  getRoutesForVersion,
  clearVersionData,
  routeKey,
} from "./routeVersioning";

beforeEach(() => {
  clearVersionData();
});

describe("routeKey", () => {
  it("formats key as METHOD:path", () => {
    expect(routeKey("get", "/users")).toBe("GET:/users");
  });
});

describe("setRouteVersion / getRouteVersion", () => {
  it("stores and retrieves a version", () => {
    setRouteVersion("GET", "/users", "v1");
    expect(getRouteVersion("GET", "/users")).toBe("v1");
  });

  it("returns undefined for unknown route", () => {
    expect(getRouteVersion("GET", "/unknown")).toBeUndefined();
  });

  it("overwrites existing version", () => {
    setRouteVersion("GET", "/users", "v1");
    setRouteVersion("GET", "/users", "v2");
    expect(getRouteVersion("GET", "/users")).toBe("v2");
  });
});

describe("removeRouteVersion", () => {
  it("removes an existing version and returns true", () => {
    setRouteVersion("POST", "/items", "v1");
    expect(removeRouteVersion("POST", "/items")).toBe(true);
    expect(getRouteVersion("POST", "/items")).toBeUndefined();
  });

  it("returns false when route not found", () => {
    expect(removeRouteVersion("DELETE", "/missing")).toBe(false);
  });
});

describe("getAllVersions", () => {
  it("returns all route-version mappings", () => {
    setRouteVersion("GET", "/a", "v1");
    setRouteVersion("POST", "/b", "v2");
    const all = getAllVersions();
    expect(all["GET:/a"]).toBe("v1");
    expect(all["POST:/b"]).toBe("v2");
  });
});

describe("recordVersionHit / getHitsByVersion", () => {
  it("increments hit count for the version", () => {
    setRouteVersion("GET", "/users", "v1");
    recordVersionHit("GET", "/users");
    recordVersionHit("GET", "/users");
    expect(getHitsByVersion()["v1"]).toBe(2);
  });

  it("does not record hit for unversioned route", () => {
    recordVersionHit("GET", "/unknown");
    expect(Object.keys(getHitsByVersion()).length).toBe(0);
  });
});

describe("getRoutesForVersion", () => {
  it("returns all routes for a given version", () => {
    setRouteVersion("GET", "/users", "v1");
    setRouteVersion("GET", "/posts", "v1");
    setRouteVersion("GET", "/admin", "v2");
    const v1Routes = getRoutesForVersion("v1");
    expect(v1Routes).toContain("GET:/users");
    expect(v1Routes).toContain("GET:/posts");
    expect(v1Routes).not.toContain("GET:/admin");
  });
});
