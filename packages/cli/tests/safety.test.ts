import { describe, test, expect } from "bun:test";
import path from "path";
import fs from "fs";

const ROOT = path.join(import.meta.dir, "..");
const FIXTURES = path.join(ROOT, "tests/fixtures");

const run = (args: string[]) => {
  const result = Bun.spawnSync(["bun", "run", "src/index.ts", ...args], {
    cwd: ROOT,
  });
  return {
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
    exitCode: result.exitCode ?? 1,
  };
};

describe("safety guards", () => {
  test("output-dir same as input-dir → error, exit 1", () => {
    const { stderr, exitCode } = run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      FIXTURES,
      "--vrr",
      "Off",
    ]);
    expect(exitCode).toBe(1);
    expect(stderr.toLowerCase()).toMatch(
      /must differ|same as input|cannot.*same|output.*input/i,
    );
  });

  test("output-dir is subdirectory of input-dir → error, exit 1", () => {
    const subDir = path.join(FIXTURES, "output-subdir");
    const { stderr, exitCode } = run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      subDir,
      "--vrr",
      "Off",
    ]);
    expect(exitCode).toBe(1);
    expect(stderr.toLowerCase()).toMatch(
      /must differ|same as input|cannot.*same|output.*input|subdirectory/i,
    );
  });

  test("output-dir is PARENT of input-dir → allowed (not a safety violation)", () => {
    const tmpOut = "/tmp/rt4k-safety-parent-test";
    fs.mkdirSync(tmpOut, { recursive: true });
    try {
      const { exitCode } = run([
        "modify",
        "--input-dir",
        FIXTURES,
        "--output-dir",
        tmpOut,
        "--vrr",
        "Off",
      ]);
      expect(exitCode).toBe(0);
    } finally {
      fs.rmSync(tmpOut, { recursive: true, force: true });
    }
  });

  test("no setting flags → error 'No settings specified', exit 1", () => {
    const { stderr, exitCode } = run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      "/tmp/rt4k-safety-out",
    ]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("No settings specified");
  });

  test("safety guard checked before file processing begins", () => {
    const { exitCode } = run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      FIXTURES,
      "--vrr",
      "Off",
    ]);
    expect(exitCode).toBe(1);
    const files = fs.readdirSync(FIXTURES).filter((f) => f.endsWith(".rt4"));
    expect(files.length).toBe(6);
  });

  // [2026-05-17] Added single-file safety guard test
  test("--file with output-dir same as file's parent dir → error, exit 1", () => {
    const tmpDir = "/tmp/rt4k-single-file-safety-test";
    fs.mkdirSync(tmpDir, { recursive: true });
    try {
      const fixtureFile = path.join(FIXTURES, "SNES.rt4");
      const tmpFile = path.join(tmpDir, "SNES.rt4");
      fs.copyFileSync(fixtureFile, tmpFile);

      const { stderr, exitCode } = run([
        "modify",
        "--file",
        tmpFile,
        "--output-dir",
        tmpDir,
        "--vrr",
        "Off",
      ]);
      expect(exitCode).toBe(1);
      expect(stderr.toLowerCase()).toMatch(/overwrite/i);
      expect(fs.existsSync(fixtureFile)).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
