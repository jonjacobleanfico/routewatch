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
  it("formats method and path correctly", () => {
    expect(routeKey("get", "/users")).toBe("GET /users");
    expect(routeKey("POST", "/items")).toBe("POST /items");
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
    addRouteToGroup("api", "GET", "/items");
    removeRouteFromGroup("api", "GET", "/items");
    expect(getRoutesInGroup("api")).not.toContain("GET /items");
  });

  it("does nothing for unknown group", () => {
    expect(() => removeRouteFromGroup("noop", "GET", "/x")).not.toThrow();
  });
});

describe("getGroupForRoute", () => {
  it("returns the group name for a known route", () => {
    addRouteToGroup("public", "GET", "/health");
    expect(getGroupForRoute("GET", "/health")).toBe("public");
  });

  it("returns undefined for an unregistered route", () => {
    expect(getGroupForRoute("DELETE", "/unknown")).toBeUndefined();
  });
});

describe("getAllGroups", () => {
  it("returns all groups with their routes", () => {
    addRouteToGroup("admin", "GET", "/admin");
    addRouteToGroup("public", "GET", "/home");
    const all = getAllGroups();
    expect(all["admin"]).toContain("GET /admin");
    expect(all["public"]).toContain("GET /home");
  });
});

describe("deleteGroup", () => {
  it("removes an existing group", () => {
    addRouteToGroup("temp", "GET", "/tmp");
    expect(deleteGroup("temp")).toBe(true);
    expect(getRoutesInGroup("temp")).toEqual([]);
  });

  it("returns false for a non-existent group", () => {
    expect(deleteGroup("ghost")).toBe(false);
  });
});
