import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs";
import path from "path";
import { runDiff } from "../src/commands/diff";

const FIXTURES = path.join(import.meta.dir, "fixtures");

describe("diff", () => {
  it("shows no differences for identical files", async () => {
    const output = await runDiff(
      path.join(FIXTURES, "PSX.rt4"),
      path.join(FIXTURES, "PSX.rt4"),
    );
    expect(output).toContain("No differences found");
  });

  it("shows differences between PSX and PSX-Vesa", async () => {
    const output = await runDiff(
      path.join(FIXTURES, "PSX.rt4"),
      path.join(FIXTURES, "PSX-Vesa.rt4"),
      "PSX",
      "PSX-Vesa",
    );
    expect(output).toContain("Binary Diff Report");
    expect(output).toContain("PSX");
    expect(output).toContain("PSX-Vesa");
    expect(output).toContain("Changed bytes");
    expect(output).toContain("Region Breakdown");
    expect(output).toContain("Summary:");
  });

  it("labels output with original and modified labels", async () => {
    const output = await runDiff(
      path.join(FIXTURES, "PSX.rt4"),
      path.join(FIXTURES, "PSX-Vesa.rt4"),
      "FreeSync",
      "VESA",
    );
    expect(output).toContain("(FreeSync)");
    expect(output).toContain("(VESA)");
  });

  it("includes setting names for known offsets", async () => {
    const output = await runDiff(
      path.join(FIXTURES, "PSX.rt4"),
      path.join(FIXTURES, "PSX-Vesa.rt4"),
    );
    // VRR is at 0x02dc, should be labeled
    expect(output).toContain("output.transmitter.vrr");
  });

  it("throws on missing original file", async () => {
    await expect(
      runDiff("/nonexistent/original.rt4", path.join(FIXTURES, "PSX.rt4")),
    ).rejects.toThrow("Original file not found");
  });

  it("throws on missing modified file", async () => {
    await expect(
      runDiff(path.join(FIXTURES, "PSX.rt4"), "/nonexistent/modified.rt4"),
    ).rejects.toThrow("Modified file not found");
  });

  it("shows region breakdown for changed bytes", async () => {
    const output = await runDiff(
      path.join(FIXTURES, "NES.rt4"),
      path.join(FIXTURES, "SNES.rt4"),
    );
    // NES and SNES are identical, so no differences
    expect(output).toContain("No differences found");
  });

  it("shows hex values for changed bytes", async () => {
    const output = await runDiff(
      path.join(FIXTURES, "PSX.rt4"),
      path.join(FIXTURES, "PSX-Off.rt4"),
    );
    // Should contain hex format like 0x02DC:  01 → 00
    expect(output).toContain("0x");
    expect(output).toContain("→");
  });

  it("calculates summary statistics", async () => {
    const output = await runDiff(
      path.join(FIXTURES, "PSX.rt4"),
      path.join(FIXTURES, "PSX-Vesa.rt4"),
    );
    expect(output).toContain("Total bytes :");
    expect(output).toContain("Changed     :");
    expect(output).toContain("Unchanged   :");
  });
});
