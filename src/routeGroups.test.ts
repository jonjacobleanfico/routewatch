import {
  addRouteToGroup,
  removeRouteFromGroup,
  getRoutesInGroup,
  getGroupForRoute,
  getAllGroups,
  deleteGroup,
  clearAllGroups,
  routeKey,
} from "./routeGroups";

beforeEach(() => {
  clearAllGroups();
});

describe("routeKey", () => {
  it("normalizes method to uppercase", () => {
    expect(routeKey("get", "/foo")).toBe("GET /foo");
  });
});

describe("addRouteToGroup", () => {
  it("adds a route to a new group", () => {
    addRouteToGroup("auth", "GET", "/login");
    expect(getRoutesInGroup("auth")).toContain("GET /login");
  });

  it("adds multiple routes to the same group", () => {
    addRouteToGroup("auth", "GET", "/login");
    addRouteToGroup("auth", "POST", "/logout");
    const routes = getRoutesInGroup("auth");
    expect(routes).toContain("GET /login");
    expect(routes).toContain("POST /logout");
  });

  it("does not duplicate routes", () => {
    addRouteToGroup("auth", "GET", "/login");
    addRouteToGroup("auth", "GET", "/login");
    expect(getRoutesInGroup("auth").length).toBe(1);
  });
});

describe("removeRouteFromGroup", () => {
  it("removes a route from a group", () => {
    addRouteToGroup("auth", "GET", "/login");
    removeRouteFromGroup("auth", "GET", "/login");
    expect(getRoutesInGroup("auth")).not.toContain("GET /login");
  });

  it("does not throw if route was not in group", () => {
    expect(() => removeRouteFromGroup("auth", "GET", "/missing")).not.toThrow();
  });
});

describe("getGroupForRoute", () => {
  it("returns the group for a known route", () => {
    addRouteToGroup("public", "GET", "/health");
    expect(getGroupForRoute("GET", "/health")).toBe("public");
  });

  it("returns undefined for unknown route", () => {
    expect(getGroupForRoute("GET", "/unknown")).toBeUndefined();
  });
});

describe("getAllGroups", () => {
  it("returns all group names", () => {
    addRouteToGroup("a", "GET", "/a");
    addRouteToGroup("b", "GET", "/b");
    const groups = getAllGroups();
    expect(groups).toContain("a");
    expect(groups).toContain("b");
  });
});

describe("deleteGroup", () => {
  it("removes the group and clears route mappings", () => {
    addRouteToGroup("temp", "GET", "/tmp");
    deleteGroup("temp");
    expect(getAllGroups()).not.toContain("temp");
    expect(getGroupForRoute("GET", "/tmp")).toBeUndefined();
  });
});

describe("clearAllGroups", () => {
  it("clears all groups and route mappings", () => {
    addRouteToGroup("x", "GET", "/x");
    addRouteToGroup("y", "POST", "/y");
    clearAllGroups();
    expect(getAllGroups()).toHaveLength(0);
    expect(getGroupForRoute("GET", "/x")).toBeUndefined();
  });
});
