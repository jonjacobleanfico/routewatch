import {
  setMetadata,
  getMetadata,
  getAllMetadata,
  removeMetadataKey,
  clearMetadata,
  getAllRouteMetadata,
  clearAllMetadata,
} from "./routeMetadata";

beforeEach(() => {
  clearAllMetadata();
});

describe("setMetadata / getMetadata", () => {
  it("stores and retrieves a metadata value", () => {
    setMetadata("GET", "/users", "owner", "team-backend");
    expect(getMetadata("GET", "/users", "owner")).toBe("team-backend");
  });

  it("returns undefined for unknown key", () => {
    expect(getMetadata("GET", "/users", "missing")).toBeUndefined();
  });

  it("is case-insensitive on method", () => {
    setMetadata("post", "/items", "version", 2);
    expect(getMetadata("POST", "/items", "version")).toBe(2);
  });

  it("overwrites existing key", () => {
    setMetadata("GET", "/ping", "note", "old");
    setMetadata("GET", "/ping", "note", "new");
    expect(getMetadata("GET", "/ping", "note")).toBe("new");
  });
});

describe("getAllMetadata", () => {
  it("returns all keys for a route", () => {
    setMetadata("GET", "/users", "owner", "alice");
    setMetadata("GET", "/users", "tier", "critical");
    expect(getAllMetadata("GET", "/users")).toEqual({ owner: "alice", tier: "critical" });
  });

  it("returns empty object for unknown route", () => {
    expect(getAllMetadata("DELETE", "/unknown")).toEqual({});
  });
});

describe("removeMetadataKey", () => {
  it("removes an existing key and returns true", () => {
    setMetadata("GET", "/users", "owner", "alice");
    const removed = removeMetadataKey("GET", "/users", "owner");
    expect(removed).toBe(true);
    expect(getMetadata("GET", "/users", "owner")).toBeUndefined();
  });

  it("returns false when key does not exist", () => {
    expect(removeMetadataKey("GET", "/nope", "key")).toBe(false);
  });
});

describe("clearMetadata", () => {
  it("removes all metadata for a route", () => {
    setMetadata("GET", "/users", "owner", "alice");
    clearMetadata("GET", "/users");
    expect(getAllMetadata("GET", "/users")).toEqual({});
  });
});

describe("getAllRouteMetadata", () => {
  it("returns metadata for all routes", () => {
    setMetadata("GET", "/a", "k", 1);
    setMetadata("POST", "/b", "k", 2);
    const all = getAllRouteMetadata();
    expect(all["GET:/a"]).toEqual({ k: 1 });
    expect(all["POST:/b"]).toEqual({ k: 2 });
  });

  it("returns a copy so mutations do not affect the store", () => {
    setMetadata("GET", "/a", "k", 1);
    const all = getAllRouteMetadata();
    all["GET:/a"].k = 999;
    expect(getMetadata("GET", "/a", "k")).toBe(1);
  });
});
