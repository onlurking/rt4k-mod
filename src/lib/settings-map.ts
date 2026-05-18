export interface SettingEntry {
  flagName: string;          // CLI flag name (e.g. "vrr")
  settingPath: string;       // rt4k setting path (e.g. "output.transmitter.vrr")
  description: string;       // Human-readable description
  validValues?: string[];    // Valid enum values (optional, for ENUM types)
}

export const SETTINGS_MAP: SettingEntry[] = [
  {
    flagName: "vrr",
    settingPath: "output.transmitter.vrr",
    description: "VRR mode",
    validValues: ["Off", "FreeSync", "VESA"],
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
