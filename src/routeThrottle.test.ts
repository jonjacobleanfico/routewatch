import {
  setThrottleRule,
  removeThrottleRule,
  getThrottleRule,
  getAllThrottleRules,
  checkThrottle,
  clearThrottleState,
  clearAllThrottleRules,
  routeKey,
} from "./routeThrottle";

beforeEach(() => {
  clearAllThrottleRules();
});

describe("routeKey", () => {
  it("formats method and path into a key", () => {
    expect(routeKey("get", "/users")).toBe("GET:/users");
    expect(routeKey("POST", "/items")).toBe("POST:/items");
  });
});

describe("setThrottleRule / getThrottleRule", () => {
  it("stores and retrieves a throttle rule", () => {
    setThrottleRule("GET", "/api/data", { maxRequests: 10, windowMs: 1000 });
    const rule = getThrottleRule("GET", "/api/data");
    expect(rule).toEqual({ maxRequests: 10, windowMs: 1000 });
  });

  it("returns undefined for unknown route", () => {
    expect(getThrottleRule("GET", "/missing")).toBeUndefined();
  });
});

describe("getAllThrottleRules", () => {
  it("returns all configured rules", () => {
    setThrottleRule("GET", "/a", { maxRequests: 5, windowMs: 500 });
    setThrottleRule("POST", "/b", { maxRequests: 2, windowMs: 200 });
    const all = getAllThrottleRules();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["GET:/a"]).toEqual({ maxRequests: 5, windowMs: 500 });
  });
});

describe("removeThrottleRule", () => {
  it("removes an existing rule", () => {
    setThrottleRule("DELETE", "/res", { maxRequests: 3, windowMs: 300 });
    removeThrottleRule("DELETE", "/res");
    expect(getThrottleRule("DELETE", "/res")).toBeUndefined();
  });
});

describe("checkThrottle", () => {
  it("allows requests within the limit", () => {
    setThrottleRule("GET", "/limited", { maxRequests: 3, windowMs: 5000 });
    const r1 = checkThrottle("GET", "/limited");
    const r2 = checkThrottle("GET", "/limited");
    const r3 = checkThrottle("GET", "/limited");
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests exceeding the limit", () => {
    setThrottleRule("GET", "/limited", { maxRequests: 2, windowMs: 5000 });
    checkThrottle("GET", "/limited");
    checkThrottle("GET", "/limited");
    const r3 = checkThrottle("GET", "/limited");
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("allows all requests when no rule is set", () => {
    const result = checkThrottle("GET", "/unrestricted");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(-1);
  });

  it("resets count after window expires", () => {
    setThrottleRule("GET", "/reset", { maxRequests: 1, windowMs: 1 });
    checkThrottle("GET", "/reset");
    const blocked = checkThrottle("GET", "/reset");
    expect(blocked.allowed).toBe(false);
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        const after = checkThrottle("GET", "/reset");
        expect(after.allowed).toBe(true);
        resolve();
      }, 10)
    );
  });

  it("clearThrottleState resets counters without removing rules", () => {
    setThrottleRule("GET", "/x", { maxRequests: 1, windowMs: 5000 });
    checkThrottle("GET", "/x");
    clearThrottleState();
    const result = checkThrottle("GET", "/x");
    expect(result.allowed).toBe(true);
  });
});
