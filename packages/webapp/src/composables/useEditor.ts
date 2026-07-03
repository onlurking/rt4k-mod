import { ref, computed } from 'vue'
import type { CoreSettings } from '../types'
import { useProfile } from './useProfile'
import { useHistory } from './useHistory'

const selectedCore = ref<string | 'defaults'>('defaults')

export function useEditor() {
  const { config } = useProfile()
  const history = useHistory()

  function selectCore(name: string | 'defaults') {
    selectedCore.value = name
  }

  function setSetting(settingPath: string, value: string | number | boolean) {
    if (!config.value) return
    history.snapshot(`Set ${settingPath}`)
    if (selectedCore.value === 'defaults') {
      config.value.defaults[settingPath] = value
    } else {
      const core = config.value.cores[selectedCore.value]
      if (core === null || core === undefined) {
        config.value.cores[selectedCore.value] = { [settingPath]: value }
      } else {
        core[settingPath] = value
      }
    }
  }

  function resetSetting(settingPath: string) {
    if (!config.value || selectedCore.value === 'defaults') return
    history.snapshot(`Reset ${settingPath}`)
    const core = config.value.cores[selectedCore.value]
    if (core && settingPath in core) {
      delete core[settingPath]
      if (Object.keys(core).length === 0) {
        config.value.cores[selectedCore.value] = null
      }
    }
  }

  function resetCore(name: string) {
    if (!config.value) return
    history.snapshot(`Reset core ${name}`)
    config.value.cores[name] = null
  }

  function resetAllCores() {
    if (!config.value) return
    history.snapshot('Reset all cores')
    for (const name of Object.keys(config.value.cores)) {
      config.value.cores[name] = null
    }
  }

  const modifiedCores = computed(() => {
    if (!config.value) return new Set<string>()
    const result = new Set<string>()
    for (const [name, settings] of Object.entries(config.value.cores)) {
      if (settings !== null) result.add(name)
    }
    return result
  })

  const effectiveSettings = computed<CoreSettings>(() => {
    if (!config.value) return {}
    if (selectedCore.value === 'defaults') return { ...config.value.defaults }
    const core = config.value.cores[selectedCore.value]
    if (!core) return { ...config.value.defaults }
    return { ...config.value.defaults, ...core }
  })

  function isCoreModified(name: string): boolean {
    if (!config.value) return false
    return config.value.cores[name] !== null
  }

  function nextModifiedCore(): void {
    const names = Array.from(modifiedCores.value).sort()
    if (names.length === 0) return
    const current = selectedCore.value === 'defaults' ? '' : selectedCore.value
    const idx = names.indexOf(current)
    selectCore(names[(idx + 1) % names.length])
  }

  function prevModifiedCore(): void {
    const names = Array.from(modifiedCores.value).sort()
    if (names.length === 0) return
    const current = selectedCore.value === 'defaults' ? '' : selectedCore.value
    const idx = names.indexOf(current)
    selectCore(names[(idx - 1 + names.length) % names.length])
  }

  function bulkSetSetting(settingPath: string, value: string | number | boolean, onlyModified = false) {
    if (!config.value) return
    history.snapshot(`Bulk set ${settingPath}`)
    for (const [name, settings] of Object.entries(config.value.cores)) {
      if (onlyModified && settings === null) continue
      if (settings === null) {
        config.value.cores[name] = { [settingPath]: value }
      } else {
        settings[settingPath] = value
      }
    }
  }

  return {
    selectedCore,
    selectCore,
    setSetting,
    resetSetting,
    resetCore,
    resetAllCores,
    modifiedCores,
    effectiveSettings,
    isCoreModified,
    nextModifiedCore,
    prevModifiedCore,
    bulkSetSetting,
  }
}
