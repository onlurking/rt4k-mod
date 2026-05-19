import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import {
  readFileBinary,
  writeFileBinary,
} from "../../../src/lib/rt4k/file-utils";
import { ProfileNotFoundError } from "../../../src/lib/rt4k/exceptions";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";

describe("file-utils", () => {
  const tempDir = "/tmp/rt4k-test-" + Date.now();

  beforeAll(() => {
    mkdirSync(tempDir, { recursive: true });
  });

  afterAll(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }
  });

  describe("readFileBinary", () => {
    it("should read the SNES.rt4 fixture file", async () => {
      const data = await readFileBinary("tests/fixtures/SNES.rt4");
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data.length).toBe(23004);
    });

    it("should throw ProfileNotFoundError for nonexistent file", async () => {
      try {
        await readFileBinary("/nonexistent/path.rt4");
        expect.unreachable("Should have thrown ProfileNotFoundError");
      } catch (err) {
        expect(err).toBeInstanceOf(ProfileNotFoundError);
      }
    });
  });

  describe("writeFileBinary", () => {
    it("should write and read back the same bytes", async () => {
      const testData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);
      const testPath = join(tempDir, "test.bin");

      await writeFileBinary(testPath, testData);
      const readData = await readFileBinary(testPath);

      expect(readData).toEqual(testData);
    });
  });
});
