import { describe, test, expect } from "bun:test";
import path from "path";

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

describe("inspect subcommand", () => {
  describe("single file mode", () => {
    test("outputs valid JSON for a .rt4 file", () => {
      const { stdout, exitCode } = run(["inspect", "--file", path.join(FIXTURES, "SNES.rt4")]);
      expect(exitCode).toBe(0);
      const parsed = JSON.parse(stdout);
      expect(parsed).toBeTruthy();
      expect(typeof parsed).toBe("object");
    });

    test("JSON contains expected setting keys", () => {
      const { stdout } = run(["inspect", "--file", path.join(FIXTURES, "SNES.rt4")]);
      const parsed = JSON.parse(stdout);
      expect(parsed).toHaveProperty("output");
      expect(parsed.output).toHaveProperty("transmitter");
      expect(parsed.output.transmitter).toHaveProperty("vrr");
    });

    test("--pretty outputs indented JSON", () => {
      const { stdout, exitCode } = run(["inspect", "--file", path.join(FIXTURES, "SNES.rt4"), "--pretty"]);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("\n");
      const parsed = JSON.parse(stdout);
      expect(parsed).toBeTruthy();
    });

    test("non-existent file exits with code 1", () => {
      const { stderr, exitCode } = run(["inspect", "--file", "/nonexistent/file.rt4"]);
      expect(exitCode).toBe(1);
      expect(stderr.toLowerCase()).toMatch(/not found|does not exist|no such file|error/i);
    });
  });

  describe("directory mode", () => {
    test("outputs one NDJSON line per .rt4 file", () => {
      const { stdout, exitCode } = run(["inspect", "--input-dir", FIXTURES]);
      expect(exitCode).toBe(0);
      const lines = stdout.trim().split("\n").filter(l => l.trim());
      expect(lines.length).toBe(6); // SNES.rt4, Genesis.rt4, NES.rt4, SNES-2.rt4, SNES-3.rt4
    });

    test("each NDJSON line is valid JSON with file and settings fields", () => {
      const { stdout } = run(["inspect", "--input-dir", FIXTURES]);
      const lines = stdout.trim().split("\n").filter(l => l.trim());
      for (const line of lines) {
        const parsed = JSON.parse(line);
        expect(parsed).toHaveProperty("file");
        expect(parsed).toHaveProperty("settings");
        expect(typeof parsed.file).toBe("string");
        expect(typeof parsed.settings).toBe("object");
      }
    });

    test("file field is a filename (not full path)", () => {
      const { stdout } = run(["inspect", "--input-dir", FIXTURES]);
      const lines = stdout.trim().split("\n").filter(l => l.trim());
      const filenames = lines.map(l => JSON.parse(l).file);
      expect(filenames.some(f => f.includes("SNES.rt4") || f.endsWith("SNES.rt4"))).toBe(true);
    });

    test("settings contain VRR field in directory mode", () => {
      const { stdout } = run(["inspect", "--input-dir", FIXTURES]);
      const lines = stdout.trim().split("\n").filter(l => l.trim());
      for (const line of lines) {
        const parsed = JSON.parse(line);
        expect(parsed.settings).toHaveProperty("output");
        expect(parsed.settings.output.transmitter).toHaveProperty("vrr");
      }
    });

    test("non-existent directory exits with code 1", () => {
      const { exitCode, stderr } = run(["inspect", "--input-dir", "/tmp/nonexistent-rt4k-dir-xyz"]);
      expect(exitCode).toBe(1);
      expect(stderr.toLowerCase()).toMatch(/not found|does not exist|no such|error/i);
    });
  });
});
