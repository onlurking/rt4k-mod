import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import path from "path";
import fs from "fs";

const ROOT = path.join(import.meta.dir, "..");
const FIXTURES = path.join(ROOT, "tests/fixtures");
const OUT_DIR = "/tmp/rt4k-mod-test-output";

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

beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

afterAll(() => {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
});

describe("modify subcommand - single file", () => {
  test("creates output file when modifying --file", () => {
    const { exitCode } = run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", OUT_DIR, "--vrr", "Off"]);
    expect(exitCode).toBe(0);
    expect(fs.existsSync(path.join(OUT_DIR, "SNES.rt4"))).toBe(true);
  });

  test("output file has VRR set to Off", async () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", OUT_DIR, "--vrr", "Off"]);
    const { stdout } = run(["inspect", "--file", path.join(OUT_DIR, "SNES.rt4")]);
    const parsed = JSON.parse(stdout);
    expect(parsed.output.transmitter.vrr).toBe("Off");
  });

  test("original file unchanged after modify (checksum)", () => {
    const original = path.join(FIXTURES, "SNES.rt4");
    const before = fs.readFileSync(original);
    run(["modify", "--file", original, "--output-dir", OUT_DIR, "--vrr", "Off"]);
    const after = fs.readFileSync(original);
    expect(Buffer.compare(before, after)).toBe(0);
  });

  test("multiple flags all apply correctly", () => {
    const tmpDir = path.join(OUT_DIR, "multi");
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", tmpDir, "--vrr", "Off", "--input", "HDMI"]);
    const { stdout } = run(["inspect", "--file", path.join(tmpDir, "SNES.rt4")]);
    const parsed = JSON.parse(stdout);
    expect(parsed.output.transmitter.vrr).toBe("Off");
    expect(parsed.input).toBe("HDMI");
  });

  test("output directory created automatically if not exists", () => {
    const newDir = path.join(OUT_DIR, "auto-created-" + Date.now());
    expect(fs.existsSync(newDir)).toBe(false);
    const { exitCode } = run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", newDir, "--vrr", "Off"]);
    expect(exitCode).toBe(0);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  test("invalid enum value exits 1 with valid values listed", () => {
    const { stderr, exitCode } = run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", OUT_DIR, "--vrr", "Bogus"]);
    expect(exitCode).toBe(1);
    expect(stderr).toMatch(/Off|FreeSync|VESA/);
  });

  test("no setting flags exits 1 with 'No settings specified'", () => {
    const { stderr, exitCode } = run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", OUT_DIR]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("No settings specified");
  });

  test("non-existent input file exits 1 with error", () => {
    const { stderr, exitCode } = run(["modify", "--file", "/nonexistent/file.rt4", "--output-dir", OUT_DIR, "--vrr", "Off"]);
    expect(exitCode).toBe(1);
    expect(stderr.toLowerCase()).toMatch(/not found|does not exist|no such file|error/i);
  });
});
