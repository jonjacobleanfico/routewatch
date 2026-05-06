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

  it("overwrites an existing annotation", () => {
    setAnnotation("GET /users", "Old note");
    setAnnotation("GET /users", "New note");
    expect(getAnnotation("GET /users")).toBe("New note");
  });

  it("returns undefined for unknown route", () => {
    expect(getAnnotation("DELETE /unknown")).toBeUndefined();
  });
});

describe("removeAnnotation", () => {
  it("removes an existing annotation", () => {
    setAnnotation("POST /items", "Creates an item");
    removeAnnotation("POST /items");
    expect(getAnnotation("POST /items")).toBeUndefined();
  });

  it("does not throw when removing a non-existent annotation", () => {
    expect(() => removeAnnotation("GET /nope")).not.toThrow();
  });
});

describe("getAllAnnotations", () => {
  it("returns all stored annotations", () => {
    setAnnotation("GET /a", "note a");
    setAnnotation("POST /b", "note b");
    const all = getAllAnnotations();
    expect(all).toEqual({
      "GET /a": "note a",
      "POST /b": "note b",
    });
  });

  it("returns empty object when no annotations exist", () => {
    expect(getAllAnnotations()).toEqual({});
  });
});

describe("clearAnnotations", () => {
  it("removes all annotations", () => {
    setAnnotation("GET /x", "x");
    setAnnotation("GET /y", "y");
    clearAnnotations();
    expect(getAllAnnotations()).toEqual({});
  });
});
