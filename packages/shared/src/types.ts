export enum DataType {
  SIGNED_INT = 'SIGNED_INTEGER',
  SIGNED_SHORT = 'SIGNED_SHORT',
  INT = 'INTEGER',
  STR = 'STRING',
  BIT = 'BIT',
  ENUM = 'ENUM',
}

export interface SettingDef {
  name: string
  desc: string
  byteRanges: { address: number; length: number }[]
  type: DataType
  readOnly?: boolean
  enums?: { name: string; value: Uint8Array }[]
  flagName?: string
  cliDesc?: string
}

export interface SettingGroup {
  label: string
  settingNames: string[]
}

export interface CoreSettings {
  [settingPath: string]: string | number | boolean
}

export interface ProfileConfig {
  base_profile: string
  output_dir?: string
  defaults: CoreSettings
  cores: Record<string, CoreSettings | null>
}

export interface CommandItem {
  id: string
  label: string
  group: string
  keywords?: string
  shortcut?: string
  action: () => void
}
