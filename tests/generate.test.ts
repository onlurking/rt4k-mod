import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs";
import path from "path";
import { runGenerate } from "../src/commands/generate";
import { RetroTinkProfile } from "../src/lib/rt4k/index";

const FIXTURES = path.join(import.meta.dir, "fixtures");
const BASE_PROFILE = path.join(FIXTURES, "PSX.rt4");

async function createTempDir(): Promise<string> {
  const dir = path.join("/tmp", `rt4k-gen-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}

async function cleanup(dir: string) {
  await fs.promises.rm(dir, { recursive: true, force: true });
}

describe("generate", () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanup(outputDir);
  });

  it("generates profiles for given core names", async () => {
    const result = await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "NES,SNES,Genesis",
    });

    expect(result.created).toBe(3);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);

    const files = await fs.promises.readdir(outputDir);
    expect(files.sort()).toEqual(["Genesis.rt4", "NES.rt4", "SNES.rt4"]);
  });

  it("sets input to HDMI in generated profiles", async () => {
    await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "TestCore",
    });

    const profile = await RetroTinkProfile.build(path.join(outputDir, "TestCore.rt4"));
    const input = profile.getValue("input");
    expect(input.asString()).toBe("HDMI");
  });

  it("skips existing profiles without --force", async () => {
    await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "NES,SNES",
    });

    const result = await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "NES,SNES,Genesis",
    });

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(2);
  });

  it("overwrites existing profiles with --force", async () => {
    await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "NES,SNES",
    });

    const result = await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "NES,SNES,Genesis",
      force: true,
    });

    expect(result.created).toBe(3);
    expect(result.skipped).toBe(0);
  });

  it("applies renaming rules", async () => {
    const result = await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "TurboGrafx16,GameboyColor,CDi",
    });

    expect(result.created).toBe(3);
    const files = await fs.promises.readdir(outputDir);
    expect(files.sort()).toEqual(["GBC.rt4", "TGFX16.rt4", "cd-i.rt4"]);
  });

  it("throws on missing base profile", async () => {
    await expect(
      runGenerate({
        baseProfile: "/nonexistent/profile.rt4",
        outputDir,
        cores: "NES",
      }),
    ).rejects.toThrow("Base profile not found");
  });

  it("throws when neither --cores nor --mister-path provided", async () => {
    await expect(
      runGenerate({
        baseProfile: BASE_PROFILE,
        outputDir,
      }),
    ).rejects.toThrow("Must provide --cores or --mister-path");
  });

  it("preserves base profile settings except input", async () => {
    const base = await RetroTinkProfile.build(BASE_PROFILE);
    const baseRes = base.getValue("output.resolution").asString();

    await runGenerate({
      baseProfile: BASE_PROFILE,
      outputDir,
      cores: "TestCore",
    });

    const generated = await RetroTinkProfile.build(path.join(outputDir, "TestCore.rt4"));
    expect(generated.getValue("output.resolution").asString()).toBe(baseRes);
    expect(generated.getValue("output.transmitter.vrr").asString()).toBe(
      base.getValue("output.transmitter.vrr").asString(),
    );
  });
});
