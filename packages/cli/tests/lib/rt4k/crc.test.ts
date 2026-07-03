import { describe, it, expect } from "bun:test";
import { CRC16CCITT } from "../../../src/lib/rt4k/crc";

describe("CRC16CCITT", () => {
  it("should calculate the correct CRC for the standard test vector", () => {
    const testData = Buffer.from("123456789");
    const expectedCRC = 0x31c3;
    expect(CRC16CCITT.calculate(testData)).toBe(expectedCRC);
  });

  it("should calculate CRC correctly with a start index", () => {
    const testData = Buffer.from("12345");
    const expectedCRC = 0x3352;
    expect(CRC16CCITT.calculate(testData, 2)).toBe(expectedCRC);
  });

  it("should return 0x0000 for empty data", () => {
    const testData = new Uint8Array(0);
    expect(CRC16CCITT.calculate(testData)).toBe(0x0000);
  });
});
