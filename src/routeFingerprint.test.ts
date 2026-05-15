import {
  computeFingerprint,
  setRouteFingerprint,
  getRouteFingerprint,
  getAllFingerprints,
  hasChanged,
  removeRouteFingerprint,
  clearFingerprints,
} from "./routeFingerprint";

beforeEach(() => {
  clearFingerprints();
});

describe("computeFingerprint", () => {
  it("returns a 12-char hex string", () => {
    const fp = computeFingerprint("GET", "/users");
    expect(fp).toHaveLength(12);
    expect(fp).toMatch(/^[0-9a-f]+$/);
  });

  it("produces the same fingerprint for identical inputs", () => {
    const a = computeFingerprint("GET", "/users", { version: "1" });
    const b = computeFingerprint("GET", "/users", { version: "1" });
    expect(a).toBe(b);
  });

  it("produces different fingerprints for different metadata", () => {
    const a = computeFingerprint("GET", "/users", { version: "1" });
    const b = computeFingerprint("GET", "/users", { version: "2" });
    expect(a).not.toBe(b);
  });

  it("is case-insensitive for method", () => {
    const a = computeFingerprint("get", "/users");
    const b = computeFingerprint("GET", "/users");
    expect(a).toBe(b);
  });
});

describe("setRouteFingerprint / getRouteFingerprint", () => {
  it("stores and retrieves a fingerprint entry", () => {
    const entry = setRouteFingerprint("POST", "/orders", { owner: "team-a" });
    expect(entry.method).toBe("POST");
    expect(entry.path).toBe("/orders");
    expect(entry.fingerprint).toHaveLength(12);
    expect(entry.metadata).toEqual({ owner: "team-a" });

    const retrieved = getRouteFingerprint("POST", "/orders");
    expect(retrieved).toEqual(entry);
  });

  it("returns undefined for unknown route", () => {
    expect(getRouteFingerprint("DELETE", "/unknown")).toBeUndefined();
  });

  it("overwrites an existing entry", () => {
    setRouteFingerprint("GET", "/items", { version: "1" });
    const updated = setRouteFingerprint("GET", "/items", { version: "2" });
    expect(getRouteFingerprint("GET", "/items")?.fingerprint).toBe(updated.fingerprint);
  });
});

describe("getAllFingerprints", () => {
  it("returns all stored entries", () => {
    setRouteFingerprint("GET", "/a");
    setRouteFingerprint("POST", "/b");
    expect(getAllFingerprints()).toHaveLength(2);
  });

  it("returns empty array when nothing stored", () => {
    expect(getAllFingerprints()).toEqual([]);
  });
});

describe("hasChanged", () => {
  it("returns true when no fingerprint exists", () => {
    expect(hasChanged("GET", "/new")).toBe(true);
  });

  it("returns false when fingerprint matches", () => {
    setRouteFingerprint("GET", "/stable", { v: 1 });
    expect(hasChanged("GET", "/stable", { v: 1 })).toBe(false);
  });

  it("returns true when metadata has changed", () => {
    setRouteFingerprint("GET", "/changed", { v: 1 });
    expect(hasChanged("GET", "/changed", { v: 2 })).toBe(true);
  });
});

describe("removeRouteFingerprint", () => {
  it("removes an existing entry and returns true", () => {
    setRouteFingerprint("GET", "/remove-me");
    expect(removeRouteFingerprint("GET", "/remove-me")).toBe(true);
    expect(getRouteFingerprint("GET", "/remove-me")).toBeUndefined();
  });

  it("returns false when entry does not exist", () => {
    expect(removeRouteFingerprint("GET", "/ghost")).toBe(false);
  });
});
