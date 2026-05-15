import {
  computeFingerprint,
  setRouteFingerprint,
  getRouteFingerprint,
  getAllFingerprints,
  removeRouteFingerprint,
  clearFingerprints,
  detectFingerprintChange,
} from "./routeFingerprint";

beforeEach(() => {
  clearFingerprints();
});

describe("computeFingerprint", () => {
  it("returns a stable hash for the same input", () => {
    const a = computeFingerprint("GET", "/users", { version: "1.0" });
    const b = computeFingerprint("GET", "/users", { version: "1.0" });
    expect(a).toBe(b);
  });

  it("returns different hashes for different metadata", () => {
    const a = computeFingerprint("GET", "/users", { version: "1.0" });
    const b = computeFingerprint("GET", "/users", { version: "2.0" });
    expect(a).not.toBe(b);
  });

  it("returns different hashes for different methods", () => {
    const a = computeFingerprint("GET", "/users", {});
    const b = computeFingerprint("POST", "/users", {});
    expect(a).not.toBe(b);
  });
});

describe("setRouteFingerprint / getRouteFingerprint", () => {
  it("stores and retrieves a fingerprint", () => {
    setRouteFingerprint("GET", "/orders", "abc123");
    const entry = getRouteFingerprint("GET", "/orders");
    expect(entry).not.toBeNull();
    expect(entry?.fingerprint).toBe("abc123");
  });

  it("returns null for unknown route", () => {
    expect(getRouteFingerprint("DELETE", "/unknown")).toBeNull();
  });

  it("records updatedAt timestamp", () => {
    const before = Date.now();
    setRouteFingerprint("POST", "/items", "xyz");
    const entry = getRouteFingerprint("POST", "/items");
    expect(entry!.updatedAt).toBeGreaterThanOrEqual(before);
  });
});

describe("getAllFingerprints", () => {
  it("returns all stored entries", () => {
    setRouteFingerprint("GET", "/a", "fp1");
    setRouteFingerprint("POST", "/b", "fp2");
    const all = getAllFingerprints();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe("removeRouteFingerprint", () => {
  it("removes a specific route fingerprint", () => {
    setRouteFingerprint("GET", "/remove-me", "fp");
    removeRouteFingerprint("GET", "/remove-me");
    expect(getRouteFingerprint("GET", "/remove-me")).toBeNull();
  });
});

describe("detectFingerprintChange", () => {
  it("returns changed=false when fingerprint matches stored", () => {
    setRouteFingerprint("GET", "/stable", "fp-stable");
    const result = detectFingerprintChange("GET", "/stable", "fp-stable");
    expect(result.changed).toBe(false);
  });

  it("returns changed=true when fingerprint differs", () => {
    setRouteFingerprint("GET", "/changed", "fp-old");
    const result = detectFingerprintChange("GET", "/changed", "fp-new");
    expect(result.changed).toBe(true);
    expect(result.previous).toBe("fp-old");
    expect(result.current).toBe("fp-new");
  });

  it("returns changed=false and no previous when no stored fingerprint", () => {
    const result = detectFingerprintChange("GET", "/new-route", "fp-new");
    expect(result.changed).toBe(false);
    expect(result.previous).toBeUndefined();
  });
});
