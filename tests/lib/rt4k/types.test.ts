import { describe, it, expect } from "bun:test";
import { DataType } from "../../../src/lib/rt4k/types";

describe("DataType enum", () => {
  it("should have SIGNED_INT value", () => {
    expect(DataType.SIGNED_INT as string).toBe("SIGNED_INTEGER");
  });

  it("should have INT value", () => {
    expect(DataType.INT as string).toBe("INTEGER");
  });

  it("should have STR value", () => {
    expect(DataType.STR as string).toBe("STRING");
  });

  it("should have BIT value", () => {
    expect(DataType.BIT as string).toBe("BIT");
  });

  it("should have ENUM value", () => {
    expect(DataType.ENUM as string).toBe("ENUM");
  });

  it("should have all 6 enum values", () => {
    const values = Object.keys(DataType);
    expect(values.length).toBe(6);
    expect(values).toContain("SIGNED_INT");
    expect(values).toContain("SIGNED_SHORT");
    expect(values).toContain("INT");
    expect(values).toContain("STR");
    expect(values).toContain("BIT");
    expect(values).toContain("ENUM");
  });
});
