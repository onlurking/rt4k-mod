import { describe, test, expect } from "bun:test";
import path from "path";
import fs from "fs";

const ROOT = path.join(import.meta.dir, "..");
const FIXTURES = path.join(ROOT, "tests/fixtures");
const DRY_OUT = "/tmp/rt4k-dryrun-test";

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

describe("--dry-run mode", () => {
  test("single file dry-run prints changes without creating files", () => {
    fs.rmSync(DRY_OUT, { recursive: true, force: true });
    const { stdout, exitCode } = run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      DRY_OUT,
      "--vrr",
      "Off",
      "--dry-run",
    ]);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/vrr|output\.transmitter\.vrr/i);
    expect(stdout).toContain("Off");
    expect(fs.existsSync(DRY_OUT)).toBe(false);
  });

  test("dry-run shows old → new format", () => {
    const { stdout } = run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      DRY_OUT,
      "--vrr",
      "Off",
      "--dry-run",
    ]);
    expect(stdout).toContain("FreeSync");
    expect(stdout).toContain("Off");
    expect(stdout).toContain("→");
  });

  test("dry-run exits with code 0", () => {
    const { exitCode } = run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      DRY_OUT,
      "--vrr",
      "Off",
      "--dry-run",
    ]);
    expect(exitCode).toBe(0);
  });

  test("directory dry-run shows all files that would be modified", () => {
    const { stdout, exitCode } = run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      DRY_OUT,
      "--vrr",
      "Off",
      "--dry-run",
    ]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("SNES.rt4");
    expect(stdout).toContain("Genesis.rt4");
    expect(stdout).toContain("NES.rt4");
    expect(fs.existsSync(DRY_OUT)).toBe(false);
  });

  test("dry-run does NOT write any files to output-dir", () => {
    fs.rmSync(DRY_OUT, { recursive: true, force: true });
    run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      DRY_OUT,
      "--vrr",
      "Off",
      "--dry-run",
    ]);
    expect(fs.existsSync(DRY_OUT)).toBe(false);
  });

  test("dry-run shows vrr setting change", () => {
    const { stdout } = run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      DRY_OUT,
      "--vrr",
      "Off",
      "--dry-run",
    ]);
    expect(stdout).toMatch(/vrr|output\.transmitter\.vrr/i);
  });
});
