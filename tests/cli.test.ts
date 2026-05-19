import { describe, test, expect } from "bun:test";

describe("CLI skeleton", () => {
  const run = (args: string[]) => {
    const result = Bun.spawnSync(["bun", "run", "src/index.ts", ...args], {
      cwd: import.meta.dir + "/..",
    });
    return {
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
      exitCode: result.exitCode,
    };
  };

  test("--help shows modify and inspect", () => {
    const { stdout } = run(["--help"]);
    expect(stdout).toContain("modify");
    expect(stdout).toContain("inspect");
  });

  test("modify --help shows vrr flag", () => {
    const { stdout } = run(["modify", "--help"]);
    expect(stdout).toContain("--vrr");
    expect(stdout).toContain("--resolution");
    expect(stdout).toContain("--hdr");
    expect(stdout).toContain("--deep-color");
    expect(stdout).toContain("--input");
    expect(stdout).toContain("--dry-run");
    expect(stdout).toContain("--output-dir");
  });

  test("inspect --help shows input flags", () => {
    const { stdout } = run(["inspect", "--help"]);
    expect(stdout).toContain("--input-dir");
    expect(stdout).toContain("--file");
    expect(stdout).toContain("--pretty");
  });

  test("modify with no args exits non-zero with error", () => {
    const { stderr, exitCode } = run(["modify"]);
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("Error");
  });

  test("inspect with no args exits non-zero with error", () => {
    const { exitCode } = run(["inspect"]);
    expect(exitCode).not.toBe(0);
  });
});
