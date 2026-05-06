import {
  setAnnotation,
  getAnnotation,
  removeAnnotation,
  getAllAnnotations,
  clearAnnotations,
} from "./annotations";

beforeEach(() => {
  clearAnnotations();
});

describe("setAnnotation / getAnnotation", () => {
  it("stores and retrieves an annotation for a route", () => {
    setAnnotation("GET /users", "Returns all users");
    expect(getAnnotation("GET /users")).toBe("Returns all users");
  });

  it("returns undefined for a route with no annotation", () => {
    expect(getAnnotation("POST /orders")).toBeUndefined();
  });

  it("overwrites an existing annotation", () => {
    setAnnotation("GET /users", "old note");
    setAnnotation("GET /users", "new note");
    expect(getAnnotation("GET /users")).toBe("new note");
  });
});

describe("removeAnnotation", () => {
  it("removes an existing annotation and returns true", () => {
    setAnnotation("DELETE /items/:id", "Deletes an item");
    const removed = removeAnnotation("DELETE /items/:id");
    expect(removed).toBe(true);
    expect(getAnnotation("DELETE /items/:id")).toBeUndefined();
  });

  it("returns false when annotation does not exist", () => {
    expect(removeAnnotation("PATCH /nonexistent")).toBe(false);
  });
});

describe("getAllAnnotations", () => {
  it("returns all annotations as a plain object", () => {
    setAnnotation("GET /health", "Health check endpoint");
    setAnnotation("POST /login", "Authenticates a user");
    const all = getAllAnnotations();
    expect(all).toEqual({
      "GET /health": "Health check endpoint",
      "POST /login": "Authenticates a user",
    });
  });

  it("returns an empty object when no annotations exist", () => {
    expect(getAllAnnotations()).toEqual({});
  });
});

describe("clearAnnotations", () => {
  it("removes all annotations", () => {
    setAnnotation("GET /a", "note a");
    setAnnotation("GET /b", "note b");
    clearAnnotations();
    expect(getAllAnnotations()).toEqual({});
  });
});
