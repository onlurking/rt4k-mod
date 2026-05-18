import { describe, test, expect } from "bun:test";
import { RetroTinkProfile } from "../src/lib/rt4k/index.js";
import path from "path";

describe("rt4k-profile smoke test", () => {
  test("can load a .rt4 file and read VRR setting", async () => {
    const fixturePath = path.join(import.meta.dir, "fixtures/SNES.rt4");
    const profile = await RetroTinkProfile.build(fixturePath);
    const vrr = profile.getValue("output.transmitter.vrr").asString();
    const validVRR = ["Off", "FreeSync", "VESA"];
    expect(validVRR).toContain(vrr);
  });

  test("can read input setting", async () => {
    const fixturePath = path.join(import.meta.dir, "fixtures/SNES.rt4");
    const profile = await RetroTinkProfile.build(fixturePath);
    const inputVal = profile.getValue("input").asString();
    expect(typeof inputVal).toBe("string");
    expect(inputVal.length).toBeGreaterThan(0);
  });

  test("serializeValues returns valid JSON", async () => {
    const fixturePath = path.join(import.meta.dir, "fixtures/SNES.rt4");
    const profile = await RetroTinkProfile.build(fixturePath);
    const json = profile.serializeValues(false);
    const parsed = JSON.parse(json);
    expect(parsed).toBeTruthy();
  });
});
