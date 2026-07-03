import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import path from "path";
import fs from "fs";
import { runModify, isOutputInsideInput } from "../../src/lib/modify-pipeline.js";

const ROOT = path.join(import.meta.dir, "../..");
const FIXTURES = path.join(ROOT, "tests/fixtures");
const OUT_DIR = "/tmp/rt4k-pipeline-test-output";

beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

afterAll(() => {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
});

describe("modify pipeline - validate", () => {
  test("no input source → exit 1", async () => {
    const result = await runModify({
      file: undefined,
      inputDir: undefined,
      outputDir: OUT_DIR,
      vrr: "Off",
    });
    expect(result.exitCode).toBe(1);
    expect(result.error).toMatch(/input-dir|--file/i);
  });

  test("no setting flags → exit 1", async () => {
    const result = await runModify({
      file: path.join(FIXTURES, "SNES.rt4"),
      outputDir: OUT_DIR,
    });
    expect(result.exitCode).toBe(1);
    expect(result.error).toContain("No settings specified");
  });
});

describe("modify pipeline - checkSafety", () => {
  test("output equals input dir → exit 1", async () => {
    const result = await runModify({
      inputDir: FIXTURES,
      outputDir: FIXTURES,
      vrr: "Off",
    });
    expect(result.exitCode).toBe(1);
    expect(result.error).toMatch(/must differ|not be inside/i);
  });

  test("output is child of input dir → exit 1", async () => {
    const result = await runModify({
      inputDir: FIXTURES,
      outputDir: path.join(FIXTURES, "output-subdir"),
      vrr: "Off",
    });
    expect(result.exitCode).toBe(1);
    expect(result.error).toMatch(/must differ|not be inside/i);
  });

  test("output is parent of input dir → allowed", async () => {
    const parentDir = "/tmp/rt4k-pipeline-parent-test";
    const inputDir = path.join(parentDir, "input");
    fs.mkdirSync(inputDir, { recursive: true });
    fs.copyFileSync(
      path.join(FIXTURES, "SNES.rt4"),
      path.join(inputDir, "SNES.rt4"),
    );
    try {
      const result = await runModify({
        inputDir: inputDir,
        outputDir: parentDir, // parent of inputDir
        vrr: "Off",
      });
      // Parent is allowed — should succeed, not be a safety error
      expect(result.exitCode).toBe(0);
      expect(result.error).toBeUndefined();
    } finally {
      fs.rmSync(parentDir, { recursive: true, force: true });
    }
  });

  test("single file output would overwrite input → exit 1", async () => {
    const tmpDir = "/tmp/rt4k-pipeline-single-safety";
    fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, "SNES.rt4");
    fs.copyFileSync(path.join(FIXTURES, "SNES.rt4"), tmpFile);
    try {
      const result = await runModify({
        file: tmpFile,
        outputDir: tmpDir,
        vrr: "Off",
      });
      expect(result.exitCode).toBe(1);
      expect(result.error).toMatch(/overwrite/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe("modify pipeline - execute", () => {
  test("single file with fixture → success", async () => {
    const outDir = path.join(OUT_DIR, "exec-single");
    const result = await runModify({
      file: path.join(FIXTURES, "SNES.rt4"),
      outputDir: outDir,
      vrr: "Off",
    });
    expect(result.exitCode).toBe(0);
    expect(result.fileResults).toHaveLength(1);
    expect(result.fileResults![0].success).toBe(true);
    expect(fs.existsSync(path.join(outDir, "SNES.rt4"))).toBe(true);
  });
});

describe("modify pipeline - formatResults", () => {
  test("all success → exit 0", async () => {
    const outDir = path.join(OUT_DIR, "fmt-all-ok");
    const result = await runModify({
      inputDir: FIXTURES,
      outputDir: outDir,
      vrr: "Off",
    });
    expect(result.exitCode).toBe(0);
    expect(result.fileResults).toBeDefined();
    expect(result.fileResults!.every((f) => f.success)).toBe(true);
    expect(result.summary).toMatch(/Modified.*\/.*files/i);
  });

  test("partial failure → exit 2", async () => {
    const tempInput = "/tmp/rt4k-pipeline-partial-fail";
    fs.mkdirSync(tempInput, { recursive: true });
    fs.copyFileSync(
      path.join(FIXTURES, "SNES.rt4"),
      path.join(tempInput, "SNES.rt4"),
    );
    fs.copyFileSync(
      path.join(FIXTURES, "Genesis.rt4"),
      path.join(tempInput, "Genesis.rt4"),
    );
    fs.writeFileSync(path.join(tempInput, "corrupt.rt4"), "");

    try {
      const outDir = path.join(OUT_DIR, "fmt-partial");
      const result = await runModify({
        inputDir: tempInput,
        outputDir: outDir,
        vrr: "Off",
      });
      expect(result.exitCode).toBe(2);
      expect(result.fileResults).toHaveLength(3);
      const successes = result.fileResults!.filter((f) => f.success);
      const failures = result.fileResults!.filter((f) => !f.success);
      expect(successes.length).toBe(2);
      expect(failures.length).toBe(1);
      expect(result.summary).toMatch(/failed/i);
    } finally {
      fs.rmSync(tempInput, { recursive: true, force: true });
    }
  });
});

describe("isOutputInsideInput", () => {
  test("same path → true", () => {
    expect(isOutputInsideInput("/a/b", "/a/b")).toBe(true);
  });

  test("child path → true", () => {
    expect(isOutputInsideInput("/a/b", "/a/b/c")).toBe(true);
  });

  test("parent path → false", () => {
    expect(isOutputInsideInput("/a/b/c", "/a/b")).toBe(false);
  });

  test("sibling path → false", () => {
    expect(isOutputInsideInput("/a/b", "/a/c")).toBe(false);
  });
});
