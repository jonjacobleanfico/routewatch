import {
  recordCustomHeaders,
  getHeaderStats,
  getAllHeaderStats,
  getTopHeaderValues,
  clearHeaderLog,
  routeKey,
} from "./customHeaders";

beforeEach(() => clearHeaderLog());

const watched = ["content-type", "x-api-key", "accept"];

function makeHeaders(
  overrides: Record<string, string> = {}
): Record<string, string> {
  return { "content-type": "application/json", ...overrides };
}

describe("routeKey", () => {
  it("formats method and path", () => {
    expect(routeKey("get", "/api/test")).toBe("GET /api/test");
  });
});

describe("recordCustomHeaders", () => {
  it("records a watched header value", () => {
    recordCustomHeaders("GET", "/api/items", makeHeaders(), watched);
    const stats = getHeaderStats("GET", "/api/items");
    expect(stats["content-type"]["application/json"]).toBe(1);
  });

  it("increments count on repeated values", () => {
    recordCustomHeaders("GET", "/api/items", makeHeaders(), watched);
    recordCustomHeaders("GET", "/api/items", makeHeaders(), watched);
    const stats = getHeaderStats("GET", "/api/items");
    expect(stats["content-type"]["application/json"]).toBe(2);
  });

  it("ignores headers not in watchlist", () => {
    recordCustomHeaders("GET", "/api/items", { authorization: "Bearer token" }, watched);
    const stats = getHeaderStats("GET", "/api/items");
    expect(stats["authorization"]).toBeUndefined();
  });

  it("skips missing headers silently", () => {
    recordCustomHeaders("GET", "/api/items", {}, watched);
    const stats = getHeaderStats("GET", "/api/items");
    expect(Object.keys(stats)).toHaveLength(0);
  });
});

describe("getAllHeaderStats", () => {
  it("returns stats for all routes", () => {
    recordCustomHeaders("GET", "/a", makeHeaders(), watched);
    recordCustomHeaders("POST", "/b", makeHeaders({ "x-api-key": "abc" }), watched);
    const all = getAllHeaderStats();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe("getTopHeaderValues", () => {
  it("returns values sorted by count", () => {
    recordCustomHeaders("GET", "/api", makeHeaders({ "content-type": "text/plain" }), watched);
    recordCustomHeaders("GET", "/api", makeHeaders(), watched);
    recordCustomHeaders("GET", "/api", makeHeaders(), watched);
    const top = getTopHeaderValues("GET", "/api", "content-type", 5);
    expect(top[0].value).toBe("application/json");
    expect(top[0].count).toBe(2);
    expect(top[1].value).toBe("text/plain");
  });

  it("respects limit", () => {
    for (let i = 0; i < 10; i++) {
      recordCustomHeaders("GET", "/api", { "content-type": `type/${i}` }, watched);
    }
    const top = getTopHeaderValues("GET", "/api", "content-type", 3);
    expect(top).toHaveLength(3);
  });

  it("returns empty array for unknown route", () => {
    expect(getTopHeaderValues("GET", "/nope", "content-type")).toEqual([]);
  });
});

describe("clearHeaderLog", () => {
  it("removes all recorded data", () => {
    recordCustomHeaders("GET", "/api", makeHeaders(), watched);
    clearHeaderLog();
    expect(getAllHeaderStats()).toEqual({});
  });
});
