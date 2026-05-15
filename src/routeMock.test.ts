import {
  setMock,
  getMock,
  removeMock,
  enableMock,
  disableMock,
  getAllMocks,
  incrementMockHit,
  clearMocks,
  routeKey,
} from "./routeMock";

beforeEach(() => clearMocks());

describe("routeKey", () => {
  it("normalizes method to uppercase", () => {
    expect(routeKey("get", "/foo")).toBe("GET:/foo");
  });
});

describe("setMock / getMock", () => {
  it("stores and retrieves a mock", () => {
    setMock("GET", "/users", { status: 200, body: [] });
    const entry = getMock("GET", "/users");
    expect(entry).toBeDefined();
    expect(entry?.response.status).toBe(200);
    expect(entry?.enabled).toBe(true);
    expect(entry?.hitCount).toBe(0);
  });

  it("returns undefined for unknown mock", () => {
    expect(getMock("POST", "/unknown")).toBeUndefined();
  });

  it("preserves hitCount on overwrite", () => {
    setMock("GET", "/users", { status: 200, body: [] });
    incrementMockHit("GET", "/users");
    setMock("GET", "/users", { status: 201, body: {} });
    expect(getMock("GET", "/users")?.hitCount).toBe(1);
  });
});

describe("removeMock", () => {
  it("removes an existing mock", () => {
    setMock("DELETE", "/item", { status: 204, body: null });
    expect(removeMock("DELETE", "/item")).toBe(true);
    expect(getMock("DELETE", "/item")).toBeUndefined();
  });

  it("returns false when not found", () => {
    expect(removeMock("GET", "/nope")).toBe(false);
  });
});

describe("enableMock / disableMock", () => {
  it("disables and re-enables a mock", () => {
    setMock("GET", "/ping", { status: 200, body: "pong" });
    disableMock("GET", "/ping");
    expect(getMock("GET", "/ping")?.enabled).toBe(false);
    enableMock("GET", "/ping");
    expect(getMock("GET", "/ping")?.enabled).toBe(true);
  });
});

describe("getAllMocks", () => {
  it("returns all registered mocks", () => {
    setMock("GET", "/a", { status: 200, body: {} });
    setMock("POST", "/b", { status: 201, body: {} });
    expect(getAllMocks()).toHaveLength(2);
  });
});

describe("incrementMockHit", () => {
  it("increments hitCount", () => {
    setMock("GET", "/count", { status: 200, body: {} });
    incrementMockHit("GET", "/count");
    incrementMockHit("GET", "/count");
    expect(getMock("GET", "/count")?.hitCount).toBe(2);
  });
});
