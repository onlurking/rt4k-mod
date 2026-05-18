import { describe, test, expect, afterAll, beforeEach } from "bun:test";
import path from "path";
import fs from "fs";

const ROOT = path.join(import.meta.dir, "..");
const FIXTURES = path.join(ROOT, "tests/fixtures");
const BATCH_OUT = "/tmp/rt4k-batch-test-out";

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

beforeEach(() => {
  fs.rmSync(BATCH_OUT, { recursive: true, force: true });
  fs.mkdirSync(BATCH_OUT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(BATCH_OUT, { recursive: true, force: true });
});

describe("batch processing - input-dir mode", () => {
  test("processes all .rt4 files in directory", () => {
    const { exitCode, stdout } = run(["modify", "--input-dir", FIXTURES, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
    expect(exitCode).toBe(0);
    const files = fs.readdirSync(BATCH_OUT).filter(f => f.endsWith(".rt4"));
    expect(files.length).toBe(3);
  });

  test("output files have the correct setting applied", () => {
    run(["modify", "--input-dir", FIXTURES, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
    // Verify one output file
    const outFile = path.join(BATCH_OUT, "SNES.rt4");
    expect(fs.existsSync(outFile)).toBe(true);
    const { stdout } = run(["inspect", "--file", outFile]);
    const parsed = JSON.parse(stdout);
    expect(parsed.output.transmitter.vrr).toBe("Off");
  });

  test("prints summary of processed files", () => {
    const { stdout, exitCode } = run(["modify", "--input-dir", FIXTURES, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/3.*3|Modified.*3/i); // "Modified 3/3" or similar
  });

  test("mirrors subdirectory structure in output", () => {
    // Create a subdirectory with a copy of a fixture
    const subDir = path.join(FIXTURES, "sub");
    fs.mkdirSync(subDir, { recursive: true });
    fs.copyFileSync(path.join(FIXTURES, "SNES.rt4"), path.join(subDir, "SNES.rt4"));
    
    try {
      const { exitCode } = run(["modify", "--input-dir", FIXTURES, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
      expect(exitCode).toBe(0);
      // Should have the file at sub/SNES.rt4 in output
      expect(fs.existsSync(path.join(BATCH_OUT, "sub", "SNES.rt4"))).toBe(true);
      expect(fs.existsSync(path.join(BATCH_OUT, "SNES.rt4"))).toBe(true);
    } finally {
      fs.rmSync(subDir, { recursive: true, force: true });
    }
  });

  test("continues processing after corrupt file (partial failure → exit 2)", () => {
    // Create a temp input dir with 3 good files + 1 corrupt
    const tempInput = "/tmp/rt4k-batch-corrupt-test";
    fs.mkdirSync(tempInput, { recursive: true });
    fs.copyFileSync(path.join(FIXTURES, "SNES.rt4"), path.join(tempInput, "SNES.rt4"));
    fs.copyFileSync(path.join(FIXTURES, "Genesis.rt4"), path.join(tempInput, "Genesis.rt4"));
    fs.copyFileSync(path.join(FIXTURES, "NES.rt4"), path.join(tempInput, "NES.rt4"));
    // Create empty/corrupt file
    fs.writeFileSync(path.join(tempInput, "corrupt.rt4"), "");
    
    try {
      const { exitCode, stdout, stderr } = run(["modify", "--input-dir", tempInput, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
      expect(exitCode).toBe(2); // partial failure
      // 3 good files should still be processed
      const goodFiles = fs.readdirSync(BATCH_OUT).filter(f => f.endsWith(".rt4") && f !== "corrupt.rt4");
      expect(goodFiles.length).toBe(3);
      // Summary should show failure info
      const combined = stdout + stderr;
      expect(combined).toMatch(/3.*4|failed.*1|error.*1/i);
    } finally {
      fs.rmSync(tempInput, { recursive: true, force: true });
    }
  });

  test("exits with 0 when all files succeed", () => {
    const { exitCode } = run(["modify", "--input-dir", FIXTURES, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
    expect(exitCode).toBe(0);
  });

  test("exits with 1 when no .rt4 files found", () => {
    const emptyDir = "/tmp/rt4k-empty-dir-test";
    fs.mkdirSync(emptyDir, { recursive: true });
    try {
      const { exitCode, stderr } = run(["modify", "--input-dir", emptyDir, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
      expect(exitCode).toBe(1);
      expect(stderr).toMatch(/No .rt4 files found/i);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  test("non-.rt4 files are silently ignored", () => {
    const tempInput = "/tmp/rt4k-mixed-test";
    fs.mkdirSync(tempInput, { recursive: true });
    fs.copyFileSync(path.join(FIXTURES, "SNES.rt4"), path.join(tempInput, "SNES.rt4"));
    // Create non-.rt4 files
    fs.writeFileSync(path.join(tempInput, "auto.dv1"), "not an rt4");
    fs.writeFileSync(path.join(tempInput, "prof.map"), "not an rt4");
    
    try {
      const { exitCode } = run(["modify", "--input-dir", tempInput, "--output-dir", BATCH_OUT, "--vrr", "Off"]);
      expect(exitCode).toBe(0);
      // Only SNES.rt4 processed
      const rtFiles = fs.readdirSync(BATCH_OUT).filter(f => f.endsWith(".rt4"));
      expect(rtFiles.length).toBe(1);
      // Non-rt4 files should NOT be in output
      expect(fs.existsSync(path.join(BATCH_OUT, "auto.dv1"))).toBe(false);
      expect(fs.existsSync(path.join(BATCH_OUT, "prof.map"))).toBe(false);
    } finally {
      fs.rmSync(tempInput, { recursive: true, force: true });
    }
  });

  test("exits with 1 when input-dir does not exist", () => {
    const { exitCode, stderr } = run(["modify", "--input-dir", "/nonexistent-xyz", "--output-dir", BATCH_OUT, "--vrr", "Off"]);
    expect(exitCode).toBe(1);
    expect(stderr.toLowerCase()).toMatch(/not found|does not exist|no such/i);
  });
});
