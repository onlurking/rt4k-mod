import { describe, test, expect } from "bun:test";
import { SETTINGS_MAP, getSettingsFromFlags, getSettingByFlag } from "../src/lib/settings-map.js";

describe("SETTINGS_MAP", () => {
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

  test("vrr valid values include Off, FreeSync, VESA", () => {
    const entry = SETTINGS_MAP.find((e) => e.flagName === "vrr");
    expect(entry?.validValues).toContain("Off");
    expect(entry?.validValues).toContain("FreeSync");
    expect(entry?.validValues).toContain("VESA");
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

  test("ignores unknown flag names", () => {
    const result = getSettingsFromFlags({ unknownFlag: "value" });
    expect(result).toHaveLength(0);
  });

  test("result includes entry reference", () => {
    const result = getSettingsFromFlags({ vrr: "FreeSync" });
    expect(result[0].entry.flagName).toBe("vrr");
    expect(result[0].entry.settingPath).toBe("output.transmitter.vrr");
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

});
