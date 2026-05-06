import {
  recordError,
  getErrorLog,
  getErrorsByRoute,
  getErrorSummary,
  clearErrorLog,
  ErrorEntry,
} from "./errorTracker";

function makeError(
  method = "GET",
  path = "/api/test",
  statusCode = 500,
  message = "Something went wrong"
): ErrorEntry {
  return { method, path, statusCode, message, timestamp: Date.now() };
}

beforeEach(() => clearErrorLog());

describe("recordError / getErrorLog", () => {
  it("records a single error", () => {
    recordError(makeError());
    expect(getErrorLog()).toHaveLength(1);
  });

  it("records multiple errors", () => {
    recordError(makeError());
    recordError(makeError("POST", "/api/create", 400, "Bad input"));
    expect(getErrorLog()).toHaveLength(2);
  });

  it("returns a copy of the log", () => {
    recordError(makeError());
    const log = getErrorLog();
    log.pop();
    expect(getErrorLog()).toHaveLength(1);
  });
});

describe("getErrorsByRoute", () => {
  it("filters errors by route", () => {
    recordError(makeError("GET", "/api/foo"));
    recordError(makeError("POST", "/api/bar"));
    recordError(makeError("GET", "/api/foo", 404));
    const results = getErrorsByRoute("GET", "/api/foo");
    expect(results).toHaveLength(2);
    expect(results.every((e) => e.path === "/api/foo")).toBe(true);
  });

  it("returns empty array when no matches", () => {
    recordError(makeError());
    expect(getErrorsByRoute("DELETE", "/nope")).toHaveLength(0);
  });
});

describe("getErrorSummary", () => {
  it("counts errors per route key", () => {
    recordError(makeError("GET", "/api/foo"));
    recordError(makeError("GET", "/api/foo"));
    recordError(makeError("POST", "/api/bar"));
    const summary = getErrorSummary();
    expect(summary["GET /api/foo"]).toBe(2);
    expect(summary["POST /api/bar"]).toBe(1);
  });
});

describe("clearErrorLog", () => {
  it("empties the log", () => {
    recordError(makeError());
    clearErrorLog();
    expect(getErrorLog()).toHaveLength(0);
  });
});
