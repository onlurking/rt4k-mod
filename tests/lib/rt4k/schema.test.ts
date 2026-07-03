import { describe, it, expect } from "bun:test";
import { SCHEMA, getSettingDef, getSettingsFromFlags, getValidValuesHint } from "../../../src/lib/rt4k/schema";

describe("SCHEMA", () => {
  it("has exactly 26 entries", () => {
    expect(SCHEMA.length).toBe(26);
  });

  it("all settings have byteRanges with at least 1 entry", () => {
    for (const s of SCHEMA) {
      expect(s.byteRanges.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("getSettingDef", () => {
  it("throws for nonexistent setting", () => {
    expect(() => getSettingDef("nonexistent")).toThrow(
      "Setting not found: nonexistent",
    );
  });

  it("header is readOnly", () => {
    expect(getSettingDef("header").readOnly).toBe(true);
  });

  it("output.transmitter.vrr has 3 enums: Off, FreeSync, VESA", () => {
    const vrr = getSettingDef("output.transmitter.vrr");
    expect(vrr.enums?.length).toBe(3);
    expect(vrr.enums![0].name).toBe("Off");
    expect(vrr.enums![1].name).toBe("FreeSync");
    expect(vrr.enums![2].name).toBe("VESA");
  });

  it("output.transmitter.vrr enums[1].name === FreeSync", () => {
    expect(getSettingDef("output.transmitter.vrr").enums![1].name).toBe(
      "FreeSync",
    );
  });

  it("input has 2 byteRanges", () => {
    expect(getSettingDef("input").byteRanges.length).toBe(2);
  });
  it("input byteRanges[0].address === 872 (0x0368)", () => {
    expect(getSettingDef("input").byteRanges[0].address).toBe(872);
  });
  it("input byteRanges[1].address === 22633 (0x5869)", () => {
    expect(getSettingDef("input").byteRanges[1].address).toBe(22633);
  });
  it("input has 20 enum entries", () => {
    expect(getSettingDef("input").enums?.length).toBe(20);
  });
  it("input enums have 2-byte Uint8Array values", () => {
    for (const e of getSettingDef("input").enums!) {
      expect(e.value.length).toBe(2);
    }
  });
});

describe("CLI-exposed settings", () => {
  it("SCHEMA has 25 CLI-exposed entries (filter by flagName)", () => {
    const cliEntries = SCHEMA.filter((s) => s.flagName);
    expect(cliEntries.length).toBe(25);
  });

  it("all CLI entries have flagName, name, cliDesc", () => {
    const cliEntries = SCHEMA.filter((s) => s.flagName);
    for (const entry of cliEntries) {
      expect(entry.flagName).toBeTruthy();
      expect(entry.name).toBeTruthy();
      expect(entry.cliDesc).toBeTruthy();
    }
  });

  it("vrr flagName is vrr", () => {
    const vrr = SCHEMA.find((s) => s.name === "output.transmitter.vrr");
    expect(vrr?.flagName).toBe("vrr");
  });

  it("resolution flagName is resolution", () => {
    const res = SCHEMA.find((s) => s.name === "output.resolution");
    expect(res?.flagName).toBe("resolution");
  });
});

describe("getSettingsFromFlags", () => {
  it("returns empty for empty flags", () => {
    const result = getSettingsFromFlags({});
    expect(result).toHaveLength(0);
  });

  it("maps vrr flag correctly", () => {
    const result = getSettingsFromFlags({ vrr: "Off" });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("output.transmitter.vrr");
    expect(result[0].value).toBe("Off");
    expect(result[0].def.flagName).toBe("vrr");
  });

  it("filters undefined values", () => {
    const result = getSettingsFromFlags({ vrr: "Off", input: undefined });
    expect(result).toHaveLength(1);
  });

  it("ignores unknown flags", () => {
    const result = getSettingsFromFlags({ unknownFlag: "value" });
    expect(result).toHaveLength(0);
  });
});

describe("getValidValuesHint", () => {
  it("returns enum names for ENUM", () => {
    const vrr = getSettingDef("output.transmitter.vrr");
    const hint = getValidValuesHint(vrr);
    expect(hint).toBe("Off, FreeSync, VESA");
  });

  it("returns true, false for BIT", () => {
    const dc = getSettingDef("output.transmitter.deep_color");
    const hint = getValidValuesHint(dc);
    expect(hint).toBe("true, false");
  });

  it("returns undefined for INT", () => {
    // header is STR type, but we can test the default case with any non-ENUM/BIT
    const header = getSettingDef("header");
    const hint = getValidValuesHint(header);
    expect(hint).toBeUndefined();
  });
});
