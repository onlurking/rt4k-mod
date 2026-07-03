export interface CoreSettings {
  [settingPath: string]: string | number | boolean
}

export interface ProfileConfig {
  base_profile: string
  output_dir?: string
  defaults: CoreSettings
  cores: Record<string, CoreSettings | null>
}

export interface SettingDef {
  name: string
  desc: string
  byteRanges: { address: number; length: number }[]
  type: DataType
  readOnly?: boolean
  enums?: { name: string; value: number[] }[]
  flagName?: string
  cliDesc?: string
}

export const DataType = {
  SIGNED_INT: 'SIGNED_INTEGER',
  INT: 'INTEGER',
  STR: 'STRING',
  BIT: 'BIT',
  ENUM: 'ENUM',
} as const

export type DataType = (typeof DataType)[keyof typeof DataType]

export interface SettingGroup {
  label: string
  settingNames: string[]
}

export interface CommandItem {
  id: string
  label: string
  group: string
  keywords?: string
  shortcut?: string
  action: () => void
}
