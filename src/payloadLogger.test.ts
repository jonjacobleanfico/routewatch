import {
  recordPayload,
  getPayloadLog,
  getPayloadsByRoute,
  getPayloadSummary,
  clearPayloadLog,
  PayloadEntry,
} from "./payloadLogger";

function makeEntry(overrides: Partial<PayloadEntry> = {}): PayloadEntry {
  return {
    method: "GET",
    route: "/api/test",
    requestContentType: "application/json",
    requestBodySize: 128,
    responseContentType: "application/json",
    responseBodySize: 256,
    timestamp: Date.now(),
    ...overrides,
  };
}

beforeEach(() => clearPayloadLog());

describe("recordPayload / getPayloadLog", () => {
  it("records a payload entry", () => {
    recordPayload(makeEntry());
    expect(getPayloadLog()).toHaveLength(1);
  });

  it("returns a copy of the log", () => {
    recordPayload(makeEntry());
    const log = getPayloadLog();
    log.push(makeEntry());
    expect(getPayloadLog()).toHaveLength(1);
  });
});

describe("getPayloadsByRoute", () => {
  it("filters by method and route", () => {
    recordPayload(makeEntry({ method: "GET", route: "/api/users" }));
    recordPayload(makeEntry({ method: "POST", route: "/api/users" }));
    recordPayload(makeEntry({ method: "GET", route: "/api/items" }));

    const results = getPayloadsByRoute("GET", "/api/users");
    expect(results).toHaveLength(1);
    expect(results[0].route).toBe("/api/users");
    expect(results[0].method).toBe("GET");
  });
});

describe("getPayloadSummary", () => {
  it("returns avg sizes per route", () => {
    recordPayload(makeEntry({ method: "GET", route: "/api/data", requestBodySize: 100, responseBodySize: 200 }));
    recordPayload(makeEntry({ method: "GET", route: "/api/data", requestBodySize: 200, responseBodySize: 400 }));

    const summary = getPayloadSummary();
    expect(summary["GET /api/data"]).toEqual({
      count: 2,
      avgRequestSize: 150,
      avgResponseSize: 300,
    });
  });

  it("handles multiple routes independently", () => {
    recordPayload(makeEntry({ method: "POST", route: "/api/create", requestBodySize: 500, responseBodySize: 50 }));
    recordPayload(makeEntry({ method: "GET", route: "/api/read", requestBodySize: 0, responseBodySize: 1024 }));

    const summary = getPayloadSummary();
    expect(Object.keys(summary)).toHaveLength(2);
    expect(summary["POST /api/create"].avgRequestSize).toBe(500);
    expect(summary["GET /api/read"].avgResponseSize).toBe(1024);
  });
});

describe("clearPayloadLog", () => {
  it("empties the log", () => {
    recordPayload(makeEntry());
    clearPayloadLog();
    expect(getPayloadLog()).toHaveLength(0);
  });
});
