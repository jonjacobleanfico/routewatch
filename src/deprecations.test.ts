import {
  markDeprecated,
  recordDeprecatedHit,
  isDeprecated,
  getDeprecationEntry,
  getAllDeprecations,
  removeDeprecation,
  clearDeprecations,
} from "./deprecations";

beforeEach(() => {
  clearDeprecations();
});

describe("markDeprecated", () => {
  it("registers a route as deprecated", () => {
    markDeprecated("GET", "/api/v1/users");
    expect(isDeprecated("GET", "/api/v1/users")).toBe(true);
  });

  it("stores deprecatedSince and message", () => {
    markDeprecated("POST", "/api/v1/login", {
      deprecatedSince: "2024-01-01",
      message: "Use /api/v2/login instead",
    });
    const entry = getDeprecationEntry("POST", "/api/v1/login");
    expect(entry?.deprecatedSince).toBe("2024-01-01");
    expect(entry?.message).toBe("Use /api/v2/login instead");
  });

  it("is case-insensitive for method", () => {
    markDeprecated("get", "/api/v1/items");
    expect(isDeprecated("GET", "/api/v1/items")).toBe(true);
  });

  it("preserves hit count when re-marking a route", () => {
    markDeprecated("GET", "/api/v1/users");
    recordDeprecatedHit("GET", "/api/v1/users");
    markDeprecated("GET", "/api/v1/users", { message: "updated message" });
    const entry = getDeprecationEntry("GET", "/api/v1/users");
    expect(entry?.hitCount).toBe(1);
    expect(entry?.message).toBe("updated message");
  });
});

describe("recordDeprecatedHit", () => {
  it("increments hitCount for a deprecated route", () => {
    markDeprecated("DELETE", "/api/v1/resource");
    recordDeprecatedHit("DELETE", "/api/v1/resource");
    recordDeprecatedHit("DELETE", "/api/v1/resource");
    const entry = getDeprecationEntry("DELETE", "/api/v1/resource");
    expect(entry?.hitCount).toBe(2);
  });

  it("returns false for non-deprecated routes", () => {
    const result = recordDeprecatedHit("GET", "/api/v2/users");
    expect(result).toBe(false);
  });

  it("sets lastHitAt on hit", () => {
    markDeprecated("GET", "/api/v1/users");
    const before = new Date();
    recordDeprecatedHit("GET", "/api/v1/users");
    const entry = getDeprecationEntry("GET", "/api/v1/users");
    expect(entry?.lastHitAt).toBeInstanceOf(Date);
    expect(entry!.lastHitAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});

describe("getAllDeprecations", () => {
  it("returns all deprecated route entries", () => {
    markDeprecated("GET", "/api/v1/a");
    markDeprecated("POST", "/api/v1/b");
    const all = getAllDeprecations();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.route)).toContain("/api/v1/a");
    expect(all.map((e) => e.route)).toContain("/api/v1/b");
  });
});

describe("removeDeprecation", () => {
  it("removes a specific route from the deprecated list", () => {
    markDeprecated("GET", "/api/v1/users");
    removeDeprecation("GET", "/api/v1/users");
    expect(isDeprecated("GET", "/api/v1/users")).toBe(false);
  });
});
