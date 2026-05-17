export interface SettingEntry {
  flagName: string;          // CLI flag name (e.g. "vrr")
  settingPath: string;       // rt4k-profile path (e.g. "output.transmitter.vrr")
  description: string;       // Human-readable description
  validValues?: string[];    // Valid enum values (optional, for ENUM types)
}

export const SETTINGS_MAP: SettingEntry[] = [
  {
    flagName: "input",
    settingPath: "input",
    description: "Input source",
    validValues: [
      "HDMI",
      "Front|Composite",
      "Front|S-Video",
      "RCA|YPbPr",
      "RCA|RGsB",
      "RCA|CVBS on Green",
      "SCART|RGBS (75 Ohm)",
      "SCART|RGsB",
      "SCART|YPbPr",
      "SCART|CVBS on Pin 20",
      "SCART|CVBS on Green",
      "SCART|Y/C on Pin 20/Red",
      "HD-15|RGBHV",
      "HD-15|RGBS",
      "HD-15|RGsB",
      "HD-15|YPbPr",
      "HD-15|CVBS on Hsync",
      "HD-15|CVBS on Green",
      "HD-15|Y/C on Green/Red",
      "HD-15|Y/C on G/R (Enh.)",
    ],
  },
  {
    flagName: "resolution",
    settingPath: "output.resolution",
    description: "Output resolution",
    validValues: [
      "4K60",
      "4K50",
      "1080p60",
      "1080p50",
      "1440p60",
      "1440p50",
      "1080p100",
      "1440p100",
      "1080p120",
      "1440p120",
      "480p60",
      "Custom 1",
      "Custom 2",
      "Custom 3",
      "Custom 4",
    ],
  },
  {
    flagName: "hdr",
    settingPath: "output.transmitter.hdr",
    description: "HDR mode",
    validValues: ["Off", "HDR10 [8-bit]", "HLG [8-bit]"],
  },
  {
    flagName: "colorimetry",
    settingPath: "output.transmitter.colorimetry",
    description: "Colorimetry",
    validValues: ["Auto-Rec.709", "Rec.709", "Rec.2020", "Adobe RGB", "Display-P3"],
  },
  {
    flagName: "rgb-range",
    settingPath: "output.transmitter.rgb_range",
    description: "RGB range",
    validValues: ["Full", "Limited"],
  },
  {
    flagName: "sync-lock",
    settingPath: "output.transmitter.sync_lock",
    description: "Sync lock mode",
    validValues: ["Triple Buffer", "Gen Lock", "Frame Lock"],
  },
  {
    flagName: "vrr",
    settingPath: "output.transmitter.vrr",
    description: "VRR mode",
    validValues: ["Off", "FreeSync", "VESA"],
  },
  {
    flagName: "deep-color",
    settingPath: "output.transmitter.deep_color",
    description: "Deep color",
    validValues: ["true", "false"],
  },
  {
    flagName: "mask-enabled",
    settingPath: "advanced.effects.mask.enabled",
    description: "Mask enabled",
    validValues: ["true", "false"],
  },
  {
    flagName: "mask-strength",
    settingPath: "advanced.effects.mask.strength",
    description: "Mask strength (integer)",
  },
  {
    flagName: "mask-path",
    settingPath: "advanced.effects.mask.path",
    description: "Mask file path",
  },
];

export function getSettingsFromFlags(
  flags: Record<string, string | undefined>
): Array<{ path: string; value: string; entry: SettingEntry }> {
  const results: Array<{ path: string; value: string; entry: SettingEntry }> = [];
  for (const entry of SETTINGS_MAP) {
    const value = flags[entry.flagName];
    if (value !== undefined) {
      results.push({ path: entry.settingPath, value, entry });
    }
  }
  return results;
}

export function getSettingByFlag(flagName: string): SettingEntry | undefined {
  return SETTINGS_MAP.find((e) => e.flagName === flagName);
}
