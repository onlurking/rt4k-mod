import { computed } from 'vue'
import type { CommandItem } from '../types'
import { SCHEMA, getEnumOptions } from '../schema'
import { DataType } from '../types'
import { useProfile } from './useProfile'
import { useEditor } from './useEditor'

export type SubPromptType = 'enum' | 'number' | 'text' | null

export interface SubPromptState {
  type: SubPromptType
  label: string
  options?: string[]
  settingPath?: string
  bulk?: boolean
}

export function useCommands(
  triggerFileImport: () => void,
  showPreview: { value: boolean },
  sidebarVisible: { value: boolean },
) {
  const { config, exportConfig, coreNames } = useProfile()
  const {
    selectedCore,
    selectCore,
    setSetting,
    resetCore,
    resetAllCores,
    nextModifiedCore,
    prevModifiedCore,
    bulkSetSetting,
  } = useEditor()

  const allCommands = computed<CommandItem[]>(() => {
    const commands: CommandItem[] = []

    // File — always available
    commands.push({
      id: 'file:import',
      label: 'Import JSON',
      group: 'File',
      keywords: 'import open load config',
      shortcut: 'Ctrl+O',
      action: triggerFileImport,
    })
    commands.push({
      id: 'file:export',
      label: 'Export JSON',
      group: 'File',
      keywords: 'export save download',
      shortcut: 'Ctrl+S',
      action: () => exportConfig(),
    })

    // View — always available
    commands.push({
      id: 'view:preview',
      label: 'Toggle JSON Preview',
      group: 'View',
      keywords: 'preview json diff',
      shortcut: 'Ctrl+Shift+P',
      action: () => (showPreview.value = !showPreview.value),
    })
    commands.push({
      id: 'view:sidebar',
      label: 'Toggle sidebar',
      group: 'View',
      keywords: 'sidebar panel',
      shortcut: 'Ctrl+B',
      action: () => (sidebarVisible.value = !sidebarVisible.value),
    })

    // Everything below requires a loaded config
    if (!config.value) return commands

    // Navigation - Defaults
    commands.push({
      id: 'nav:defaults',
      label: 'Go to Defaults',
      group: 'Navigation',
      keywords: 'defaults home',
      action: () => selectCore('defaults'),
    })

    // Navigation - Cores
    for (const name of coreNames.value) {
      commands.push({
        id: `nav:core:${name}`,
        label: `Go to ${name}`,
        group: 'Navigation',
        keywords: name.toLowerCase(),
        action: () => selectCore(name),
      })
    }

    // Navigation - Modified
    commands.push({
      id: 'nav:next-modified',
      label: 'Next modified core',
      group: 'Navigation',
      keywords: 'next modified',
      action: () => nextModifiedCore(),
    })
    commands.push({
      id: 'nav:prev-modified',
      label: 'Previous modified core',
      group: 'Navigation',
      keywords: 'previous modified',
      action: () => prevModifiedCore(),
    })

    // Settings - Enum-based (opens sub-prompt)
    const enumSettings = SCHEMA.filter((s) => s.type === DataType.ENUM && !s.readOnly)
    for (const def of enumSettings) {
      commands.push({
        id: `setting:enum:${def.name}`,
        label: `Set ${def.desc}…`,
        group: 'Settings',
        keywords: `${def.name} ${def.desc} ${def.cliDesc ?? ''}`.toLowerCase(),
        action: () => {}, // handled via sub-prompt
      })
    }

    // Settings - Number-based
    const numSettings = SCHEMA.filter((s) => s.type === DataType.SIGNED_INT && !s.readOnly)
    for (const def of numSettings) {
      commands.push({
        id: `setting:num:${def.name}`,
        label: `Set ${def.desc}…`,
        group: 'Settings',
        keywords: `${def.name} ${def.desc} ${def.cliDesc ?? ''}`.toLowerCase(),
        action: () => {},
      })
    }

    // Settings - String-based
    const strSettings = SCHEMA.filter((s) => s.type === DataType.STR && !s.readOnly)
    for (const def of strSettings) {
      commands.push({
        id: `setting:str:${def.name}`,
        label: `Set ${def.desc}…`,
        group: 'Settings',
        keywords: `${def.name} ${def.desc} ${def.cliDesc ?? ''}`.toLowerCase(),
        action: () => {},
      })
    }

    // Settings - Bool toggle
    const boolSettings = SCHEMA.filter((s) => s.type === DataType.BIT && !s.readOnly)
    for (const def of boolSettings) {
      commands.push({
        id: `setting:bool:${def.name}`,
        label: `Toggle ${def.desc}`,
        group: 'Settings',
        keywords: `${def.name} ${def.desc} ${def.cliDesc ?? ''}`.toLowerCase(),
        action: () => {
          const current = effectiveValue(def.name)
          setSetting(def.name, !current)
        },
      })
    }

    // Settings - Reset
    if (selectedCore.value !== 'defaults') {
      commands.push({
        id: 'setting:reset-core',
        label: `Reset ${selectedCore.value} to defaults`,
        group: 'Settings',
        keywords: 'reset clear defaults',
        action: () => resetCore(selectedCore.value as string),
      })
    }

    // Bulk Edit
    for (const def of enumSettings) {
      commands.push({
        id: `bulk:enum:${def.name}`,
        label: `Set ${def.desc} for all cores…`,
        group: 'Bulk Edit',
        keywords: `bulk all ${def.name} ${def.desc}`.toLowerCase(),
        action: () => {},
      })
    }
    for (const def of numSettings) {
      commands.push({
        id: `bulk:num:${def.name}`,
        label: `Set ${def.desc} for all cores…`,
        group: 'Bulk Edit',
        keywords: `bulk all ${def.name} ${def.desc}`.toLowerCase(),
        action: () => {},
      })
    }
    commands.push({
      id: 'bulk:reset-all',
      label: 'Reset all cores to defaults',
      group: 'Bulk Edit',
      keywords: 'bulk reset all clear',
      action: () => {
        if (confirm('Reset all cores to defaults? This cannot be undone.')) {
          resetAllCores()
        }
      },
    })

    return commands
  })

  function effectiveValue(settingPath: string): unknown {
    if (!config.value) return undefined
    const core =
      selectedCore.value === 'defaults'
        ? config.value.defaults
        : config.value.cores[selectedCore.value] ?? config.value.defaults
    return core[settingPath] ?? config.value.defaults[settingPath]
  }

  function getSubPrompt(commandId: string): SubPromptState | null {
    // Settings - enum
    const enumMatch = commandId.match(/^setting:enum:(.+)$/)
    if (enumMatch) {
      const path = enumMatch[1]
      const options = getEnumOptions(path)
      return { type: 'enum', label: `Set ${path}`, options, settingPath: path }
    }

    // Settings - number
    const numMatch = commandId.match(/^setting:num:(.+)$/)
    if (numMatch) {
      const def = SCHEMA.find((s) => s.name === numMatch[1])
      return {
        type: 'number',
        label: `Set ${def?.desc ?? numMatch[1]}`,
        settingPath: numMatch[1],
      }
    }

    // Settings - string
    const strMatch = commandId.match(/^setting:str:(.+)$/)
    if (strMatch) {
      const def = SCHEMA.find((s) => s.name === strMatch[1])
      return {
        type: 'text',
        label: `Set ${def?.desc ?? strMatch[1]}`,
        settingPath: strMatch[1],
      }
    }

    // Bulk - enum
    const bulkEnumMatch = commandId.match(/^bulk:enum:(.+)$/)
    if (bulkEnumMatch) {
      const path = bulkEnumMatch[1]
      const options = getEnumOptions(path)
      return { type: 'enum', label: `Set ${path} for all`, options, settingPath: path, bulk: true }
    }

    // Bulk - number
    const bulkNumMatch = commandId.match(/^bulk:num:(.+)$/)
    if (bulkNumMatch) {
      const def = SCHEMA.find((s) => s.name === bulkNumMatch[1])
      return {
        type: 'number',
        label: `Set ${def?.desc ?? bulkNumMatch[1]} for all`,
        settingPath: bulkNumMatch[1],
        bulk: true,
      }
    }

    return null
  }

  function applySubPromptValue(prompt: SubPromptState, value: string | number | boolean) {
    if (!prompt.settingPath) return
    if (prompt.bulk) {
      bulkSetSetting(prompt.settingPath, value)
    } else {
      setSetting(prompt.settingPath, value)
    }
  }

  return {
    allCommands,
    getSubPrompt,
    applySubPromptValue,
  }
}
