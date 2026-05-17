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
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--vrr", "Off"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("Off");
  });
  test("sets vrr to FreeSync", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--vrr", "FreeSync"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("FreeSync");
  });
});

describe("individual flag: --input", () => {
  test("sets input to HDMI", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--input", "HDMI"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.input).toBe("HDMI");
  });
});

describe("individual flag: --resolution", () => {
  test("sets resolution to 1080p60", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--resolution", "1080p60"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.resolution).toBe("1080p60");
  });
});

describe("individual flag: --hdr", () => {
  test("sets hdr to Off", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--hdr", "Off"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.hdr).toBe("Off");
  });
});

describe("individual flag: --colorimetry", () => {
  test("sets colorimetry to Rec.709", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--colorimetry", "Rec.709"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.colorimetry).toBe("Rec.709");
  });
});

describe("individual flag: --rgb-range", () => {
  test("sets rgb_range to Limited", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--rgb-range", "Limited"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.rgb_range).toBe("Limited");
  });
  test("sets rgb_range to Full", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--rgb-range", "Full"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.rgb_range).toBe("Full");
  });
});

describe("individual flag: --sync-lock", () => {
  test("sets sync_lock to Triple Buffer", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--sync-lock", "Triple Buffer"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.sync_lock).toBe("Triple Buffer");
  });
});

describe("individual flag: --deep-color", () => {
  test("sets deep_color to false", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--deep-color", "false"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    // deep_color is a BIT type: serializes as boolean
    expect(settings.output.transmitter.deep_color).toBe(false);
  });
});

describe("individual flag: --mask-enabled", () => {
  test("sets mask enabled to false", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--mask-enabled", "false"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    // mask.enabled is a BIT type: serializes as boolean
    expect(settings.advanced.effects.mask.enabled).toBe(false);
  });
});

describe("individual flag: --mask-strength", () => {
  test("sets mask strength to -5", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--mask-strength", "-5"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    // mask.strength is SIGNED_INT: serializes as number
    expect(settings.advanced.effects.mask.strength).toBe(-5);
  });
});

describe("individual flag: --mask-path", () => {
  test("sets mask path", () => {
    const newPath = "RGB Masks/Slot Mask Medium RGB.bmp.bmp";
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--mask-path", newPath]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.advanced.effects.mask.path).toBe(newPath);
  });
});

describe("end-to-end workflow", () => {
  test("primary use case: disable VRR for all fixtures", () => {
    const { exitCode } = run(["modify", "--input-dir", FIXTURES, "--output-dir", INT_OUT, "--vrr", "Off"]);
    expect(exitCode).toBe(0);

    const outFiles = fs.readdirSync(INT_OUT).filter(f => f.endsWith(".rt4"));
    expect(outFiles.length).toBe(3);

    for (const filename of outFiles) {
      const settings = inspectFile(path.join(INT_OUT, filename));
      expect(settings.output.transmitter.vrr).toBe("Off");
    }
  });

  test("modify then inspect round-trip verifies correctness", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--vrr", "Off", "--input", "HDMI"]);

    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("Off");
    expect(settings.input).toBe("HDMI");
  });

  test("multiple flags applied in single call", () => {
    run([
      "modify", "--file", path.join(FIXTURES, "SNES.rt4"),
      "--output-dir", INT_OUT,
      "--vrr", "Off",
      "--hdr", "Off",
      "--rgb-range", "Full",
    ]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("Off");
    expect(settings.output.transmitter.hdr).toBe("Off");
    expect(settings.output.transmitter.rgb_range).toBe("Full");
  });

  test("NDJSON from inspect is parseable for each file", () => {
    run(["modify", "--input-dir", FIXTURES, "--output-dir", INT_OUT, "--vrr", "Off"]);
    const { stdout } = run(["inspect", "--input-dir", INT_OUT]);
    const lines = stdout.trim().split("\n").filter(l => l.trim());
    expect(lines.length).toBe(3);
    for (const line of lines) {
      const parsed = JSON.parse(line);
      expect(parsed).toHaveProperty("file");
      expect(parsed).toHaveProperty("settings");
      expect(parsed.settings.output.transmitter.vrr).toBe("Off");
    }
  });

  test("dry-run followed by actual run produces same final state", () => {
    const dryRun = run([
      "modify", "--file", path.join(FIXTURES, "SNES.rt4"),
      "--output-dir", INT_OUT,
      "--vrr", "Off",
      "--dry-run"
    ]);
    expect(dryRun.exitCode).toBe(0);
    expect(dryRun.stdout).toContain("FreeSync");
    expect(dryRun.stdout).toContain("Off");
    expect(fs.existsSync(path.join(INT_OUT, "SNES.rt4"))).toBe(false);

    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--vrr", "Off"]);
    const settings = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(settings.output.transmitter.vrr).toBe("Off");
  });

  test("original fixtures unchanged after all modifications", () => {
    const origSNES = fs.readFileSync(path.join(FIXTURES, "SNES.rt4"));
    const origGenesis = fs.readFileSync(path.join(FIXTURES, "Genesis.rt4"));
    const origNES = fs.readFileSync(path.join(FIXTURES, "NES.rt4"));

    run(["modify", "--input-dir", FIXTURES, "--output-dir", INT_OUT, "--vrr", "Off", "--input", "HDMI"]);

    expect(Buffer.compare(fs.readFileSync(path.join(FIXTURES, "SNES.rt4")), origSNES)).toBe(0);
    expect(Buffer.compare(fs.readFileSync(path.join(FIXTURES, "Genesis.rt4")), origGenesis)).toBe(0);
    expect(Buffer.compare(fs.readFileSync(path.join(FIXTURES, "NES.rt4")), origNES)).toBe(0);
  });

  test("round-trip: modify twice with different values, verify both changes", () => {
    run(["modify", "--file", path.join(FIXTURES, "SNES.rt4"), "--output-dir", INT_OUT, "--vrr", "Off"]);
    const first = inspectFile(path.join(INT_OUT, "SNES.rt4"));
    expect(first.output.transmitter.vrr).toBe("Off");

    const secondOut = INT_OUT + "-second";
    fs.mkdirSync(secondOut, { recursive: true });
    run(["modify", "--file", path.join(INT_OUT, "SNES.rt4"), "--output-dir", secondOut, "--vrr", "FreeSync"]);
    const second = inspectFile(path.join(secondOut, "SNES.rt4"));
    expect(second.output.transmitter.vrr).toBe("FreeSync");

    fs.rmSync(secondOut, { recursive: true, force: true });
  });
});
