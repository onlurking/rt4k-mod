import { describe, test, expect } from "bun:test";
import { SETTINGS_MAP, getSettingsFromFlags, getSettingByFlag } from "../src/lib/settings-map.js";

describe("SETTINGS_MAP", () => {
  test("has exactly 11 entries", () => {
    expect(SETTINGS_MAP.length).toBe(11);
  });

  test("all entries have flagName, settingPath, description", () => {
    for (const entry of SETTINGS_MAP) {
      expect(entry.flagName).toBeTruthy();
      expect(entry.settingPath).toBeTruthy();
      expect(entry.description).toBeTruthy();
    }
  });

  test("vrr maps to output.transmitter.vrr", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "vrr");
    expect(entry?.settingPath).toBe("output.transmitter.vrr");
  });

  test("input maps to input", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "input");
    expect(entry?.settingPath).toBe("input");
  });

  test("vrr valid values include Off, FreeSync, VESA", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "vrr");
    expect(entry?.validValues).toContain("Off");
    expect(entry?.validValues).toContain("FreeSync");
    expect(entry?.validValues).toContain("VESA");
  });

  test("all expected flag names present", () => {
    const flagNames = SETTINGS_MAP.map((e) => e.flagName);
    const expected = ["input", "resolution", "hdr", "colorimetry", "rgb-range",
      "sync-lock", "vrr", "deep-color", "mask-enabled", "mask-strength", "mask-path"];
    for (const name of expected) {
      expect(flagNames).toContain(name);
    }
  });

  test("input valid values match schema exactly", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "input");
    expect(entry?.validValues).toContain("HDMI");
    expect(entry?.validValues).toContain("Front|Composite");
    expect(entry?.validValues).toContain("SCART|RGBS (75 Ohm)");
    expect(entry?.validValues).toContain("HD-15|RGBHV");
  });

  test("resolution valid values match schema exactly", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "resolution");
    expect(entry?.validValues).toContain("4K60");
    expect(entry?.validValues).toContain("1080p60");
    expect(entry?.validValues).toContain("480p60");
    expect(entry?.validValues).toContain("Custom 1");
  });

  test("colorimetry valid values match schema exactly", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "colorimetry");
    expect(entry?.validValues).toContain("Auto-Rec.709");
    expect(entry?.validValues).toContain("Rec.709");
    expect(entry?.validValues).toContain("Rec.2020");
    expect(entry?.validValues).toContain("Adobe RGB");
    expect(entry?.validValues).toContain("Display-P3");
  });

  test("mask-strength has no validValues (integer type)", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "mask-strength");
    expect(entry?.validValues).toBeUndefined();
  });

  test("mask-path has no validValues (string type)", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "mask-path");
    expect(entry?.validValues).toBeUndefined();
  });
});

describe("getSettingsFromFlags", () => {
  test("returns empty array for empty flags", () => {
    const result = getSettingsFromFlags({});
    expect(result).toHaveLength(0);
  });

  test("maps vrr flag to correct path and value", () => {
    const result = getSettingsFromFlags({ vrr: "Off" });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("output.transmitter.vrr");
    expect(result[0].value).toBe("Off");
  });

  test("filters out undefined values", () => {
    const result = getSettingsFromFlags({ vrr: "Off", input: undefined });
    expect(result).toHaveLength(1);
  });

  test("handles multiple flags", () => {
    const result = getSettingsFromFlags({ vrr: "Off", input: "HDMI", resolution: "1080p60" });
    expect(result).toHaveLength(3);
    const paths = result.map((r) => r.path);
    expect(paths).toContain("output.transmitter.vrr");
    expect(paths).toContain("input");
    expect(paths).toContain("output.resolution");
  });

  test("result includes entry reference", () => {
    const result = getSettingsFromFlags({ vrr: "FreeSync" });
    expect(result[0].entry.flagName).toBe("vrr");
    expect(result[0].entry.settingPath).toBe("output.transmitter.vrr");
  });

  test("ignores unknown flag names", () => {
    const result = getSettingsFromFlags({ unknownFlag: "value" });
    expect(result).toHaveLength(0);
  });
});

describe("getSettingByFlag", () => {
  test("finds entry by flag name", () => {
    const entry = getSettingByFlag("vrr");
    expect(entry?.settingPath).toBe("output.transmitter.vrr");
  });

  test("returns undefined for unknown flag", () => {
    const entry = getSettingByFlag("nonexistent");
    expect(entry).toBeUndefined();
  });

  test("finds rgb-range entry", () => {
    const entry = getSettingByFlag("rgb-range");
    expect(entry?.settingPath).toBe("output.transmitter.rgb_range");
  });

  test("finds mask-enabled entry", () => {
    const entry = getSettingByFlag("mask-enabled");
    expect(entry?.settingPath).toBe("advanced.effects.mask.enabled");
  });
});
