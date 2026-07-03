import { describe, test, expect, beforeEach, afterAll } from "bun:test";
import path from "path";
import fs from "fs";

const ROOT = path.join(import.meta.dir, "..");
const FIXTURES = path.join(ROOT, "tests/fixtures");
const INT_OUT = "/tmp/rt4k-integration-test-out";

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

const inspectFile = (filePath: string) => {
  const { stdout } = run(["inspect", "--file", filePath]);
  return JSON.parse(stdout);
};

beforeEach(() => {
  fs.rmSync(INT_OUT, { recursive: true, force: true });
  fs.mkdirSync(INT_OUT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(INT_OUT, { recursive: true, force: true });
});

describe("individual flag: --vrr", () => {
  test("sets vrr to Off", () => {
    run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
    ]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("Off");
  });
  test("sets vrr to FreeSync", () => {
    run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      INT_OUT,
      "--vrr",
      "FreeSync",
    ]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("FreeSync");
  });
});

describe("end-to-end workflow", () => {
  test("primary use case: disable VRR for all fixtures", () => {
    const { exitCode } = run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
    ]);
    expect(exitCode).toBe(0);

    const outFiles = fs.readdirSync(INT_OUT).filter((f) => f.endsWith(".rt4"));
    expect(outFiles.length).toBe(6);

    for (const filename of outFiles) {
      const settings = inspectFile(path.join(INT_OUT, filename));
      expect(settings.output.transmitter.vrr).toBe("Off");
    }
  });

  test("modify then inspect round-trip verifies correctness", () => {
    run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
    ]);

    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("Off");
  });

  test("NDJSON from inspect is parseable for each file", () => {
    run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
    ]);
    const { stdout } = run(["inspect", "--input-dir", INT_OUT]);
    const lines = stdout
      .trim()
      .split("\n")
      .filter((l) => l.trim());
    expect(lines.length).toBe(6);
    for (const line of lines) {
      const parsed = JSON.parse(line);
      expect(parsed).toHaveProperty("file");
      expect(parsed).toHaveProperty("settings");
      expect(parsed.settings.output.transmitter.vrr).toBe("Off");
    }
  });

  test("dry-run followed by actual run produces same final state", () => {
    const dryRun = run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
      "--dry-run",
    ]);
    expect(dryRun.exitCode).toBe(0);
    expect(dryRun.stdout).toContain("FreeSync");
    expect(dryRun.stdout).toContain("Off");
    expect(fs.existsSync(path.join(INT_OUT, "SNES.rt4"))).toBe(false);

    run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
    ]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("Off");
  });

  test("original fixtures unchanged after all modifications", () => {
    const origSNES = fs.readFileSync(path.join(FIXTURES, "SNES.rt4"));
    const origGenesis = fs.readFileSync(path.join(FIXTURES, "Genesis.rt4"));
    const origNES = fs.readFileSync(path.join(FIXTURES, "NES.rt4"));

    run([
      "modify",
      "--input-dir",
      FIXTURES,
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
    ]);

    expect(
      Buffer.compare(
        fs.readFileSync(path.join(FIXTURES, "SNES.rt4")),
        origSNES,
      ),
    ).toBe(0);
    expect(
      Buffer.compare(
        fs.readFileSync(path.join(FIXTURES, "Genesis.rt4")),
        origGenesis,
      ),
    ).toBe(0);
    expect(
      Buffer.compare(fs.readFileSync(path.join(FIXTURES, "NES.rt4")), origNES),
    ).toBe(0);
  });

  test("round-trip: modify twice with different values, verify both changes", () => {
    run([
      "modify",
      "--file",
      path.join(FIXTURES, "SNES.rt4"),
      "--output-dir",
      INT_OUT,
      "--vrr",
      "Off",
    ]);
    const first = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(first.output.transmitter.vrr).toBe("Off");

    const secondOut = INT_OUT + "-second";
    fs.mkdirSync(secondOut, { recursive: true });
    run([
      "modify",
      "--file",
      path.join(INT_OUT, "SNES.rt4"),
      "--output-dir",
      secondOut,
      "--vrr",
      "FreeSync",
    ]);
    const second = inspectFile(path.join(secondOut, "SNES.rt4"));
    expect(second.output.transmitter.vrr).toBe("FreeSync");

    fs.rmSync(secondOut, { recursive: true, force: true });
  });
});
