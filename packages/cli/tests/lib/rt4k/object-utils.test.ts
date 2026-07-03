import { describe, it, expect } from "bun:test";
import {
  addValueToObject,
  flattenObject,
  deepMerge,
} from "../../../src/lib/rt4k/object-utils";

describe("addValueToObject", () => {
  it("should add value to empty object with single key", () => {
    const obj = {};
    addValueToObject(obj, ["a"], "x");
    expect(obj).toEqual({ a: "x" });
  });

  it("should add value to empty object with nested keys", () => {
    const obj = {};
    addValueToObject(obj, ["a", "b"], "x");
    expect(obj).toEqual({ a: { b: "x" } });
  });

  it("should add value to empty object with deep nested keys", () => {
    const obj = {};
    addValueToObject(obj, ["a", "b", "c"], 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  it("should add multiple values to same object", () => {
    const obj = {};
    addValueToObject(obj, ["a", "b"], "x");
    addValueToObject(obj, ["a", "c"], "y");
    expect(obj).toEqual({ a: { b: "x", c: "y" } });
  });

  it("should overwrite existing values", () => {
    const obj = { a: { b: "old" } };
    addValueToObject(obj, ["a", "b"], "new");
    expect(obj).toEqual({ a: { b: "new" } });
  });

  it("should handle various value types", () => {
    const obj = {};
    addValueToObject(obj, ["str"], "string");
    addValueToObject(obj, ["num"], 123);
    addValueToObject(obj, ["bool"], true);
    addValueToObject(obj, ["nil"], null);
    expect(obj).toEqual({
      str: "string",
      num: 123,
      bool: true,
      nil: null,
    });
  });
});

describe("flattenObject", () => {
  it("should flatten single level object", () => {
    const result = flattenObject({ a: "x", b: "y" });
    expect(result).toEqual([
      { name: "a", value: "x" },
      { name: "b", value: "y" },
    ]);
  });

  it("should flatten nested object with dot notation", () => {
    const result = flattenObject({ a: { b: "x" } });
    expect(result).toEqual([{ name: "a.b", value: "x" }]);
  });

  it("should flatten deeply nested object", () => {
    const result = flattenObject({ a: { b: { c: "x" } } });
    expect(result).toEqual([{ name: "a.b.c", value: "x" }]);
  });

  it("should flatten mixed nesting levels", () => {
    const result = flattenObject({
      a: "x",
      b: { c: "y", d: { e: "z" } },
    });
    expect(result).toEqual([
      { name: "a", value: "x" },
      { name: "b.c", value: "y" },
      { name: "b.d.e", value: "z" },
    ]);
  });

  it("should handle various primitive types", () => {
    const result = flattenObject({
      str: "hello",
      num: 42,
      bool: true,
      nil: null,
    });
    expect(result).toEqual([
      { name: "str", value: "hello" },
      { name: "num", value: 42 },
      { name: "bool", value: true },
      { name: "nil", value: null },
    ]);
  });

  it("should throw TypeError when encountering array", () => {
    expect(() => {
      flattenObject({ a: [1, 2, 3] });
    }).toThrow(TypeError);
  });

  it("should throw TypeError for nested array", () => {
    expect(() => {
      flattenObject({ a: { b: [1, 2] } });
    }).toThrow(TypeError);
  });

  it("should round-trip: flatten then reconstruct", () => {
    const original = { a: { b: "x", c: "y" }, d: "z" };
    const flattened = flattenObject(original);

    const reconstructed: Record<string, any> = {};
    for (const { name, value } of flattened) {
      addValueToObject(reconstructed, name.split("."), value);
    }

    expect(reconstructed).toEqual(original);
  });
});

describe("deepMerge", () => {
  it("should merge two flat objects", () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should override leaf values from later objects", () => {
    const result = deepMerge({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it("should merge nested objects recursively", () => {
    const result = deepMerge({ c: { x: 1 } }, { c: { y: 2 } });
    expect(result).toEqual({ c: { x: 1, y: 2 } });
  });

  it("should merge complex nested structures", () => {
    const result = deepMerge({ a: 1, c: { x: 1 } }, { b: 2, c: { y: 2 } });
    expect(result).toEqual({ a: 1, b: 2, c: { x: 1, y: 2 } });
  });

  it("should handle multiple merge sources", () => {
    const result = deepMerge({ a: 1 }, { b: 2 }, { c: 3 });
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("should handle multiple sources with overrides", () => {
    const result = deepMerge(
      { a: 1, x: "old" },
      { a: 2, y: "new" },
      { a: 3, z: "final" },
    );
    expect(result).toEqual({ a: 3, x: "old", y: "new", z: "final" });
  });

  it("should deeply merge nested objects across multiple sources", () => {
    const result = deepMerge({ a: { x: 1 } }, { a: { y: 2 } }, { a: { z: 3 } });
    expect(result).toEqual({ a: { x: 1, y: 2, z: 3 } });
  });

  it("should handle empty objects", () => {
    const result = deepMerge({}, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it("should handle no arguments", () => {
    const result = deepMerge();
    expect(result).toEqual({});
  });

  it("should handle single argument", () => {
    const result = deepMerge({ a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it("should override nested objects entirely when leaf value provided", () => {
    const result = deepMerge({ a: { x: 1, y: 2 } }, { a: "string" });
    expect(result).toEqual({ a: "string" });
  });

  it("should handle various primitive types", () => {
    const result = deepMerge(
      { str: "a", num: 1, bool: true },
      { str: "b", num: 2, bool: false },
    );
    expect(result).toEqual({ str: "b", num: 2, bool: false });
  });
});
