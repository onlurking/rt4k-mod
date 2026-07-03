import { ref, computed } from 'vue'
import type { ProfileConfig } from '../types'

const config = ref<ProfileConfig | null>(null)
const originalJson = ref<string>('')
const fileName = ref<string>('')

export function useProfile() {
  async function importConfig(file: File): Promise<void> {
    const text = await file.text()
    try {
      const parsed = JSON.parse(text) as ProfileConfig
      if (!parsed.base_profile || !parsed.cores || !parsed.defaults) {
        throw new Error('Invalid config: missing base_profile, defaults, or cores')
      }
      config.value = parsed
      originalJson.value = JSON.stringify(parsed, null, 2)
      fileName.value = file.name
    } catch (err) {
      throw new Error(`Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  function exportConfig(name?: string): void {
    if (!config.value) return
    const json = JSON.stringify(config.value, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name ?? fileName.value ?? 'profiles.json'
    a.click()
    URL.revokeObjectURL(url)
    originalJson.value = json
  }

  const isDirty = computed(() => {
    if (!config.value) return false
    return JSON.stringify(config.value, null, 2) !== originalJson.value
  })

  const coreNames = computed(() => {
    if (!config.value) return []
    return Object.keys(config.value.cores).sort()
  })

  const modifiedCoreCount = computed(() => {
    if (!config.value) return 0
    return Object.values(config.value.cores).filter((v) => v !== null).length
  })

  function restoreFromJson(json: string) {
    try {
      const parsed = JSON.parse(json) as ProfileConfig
      config.value = parsed
    } catch {
      // ignore bad snapshots
    }
  }

  function getSnapshot(): string {
    return config.value ? JSON.stringify(config.value) : ''
  }

  return {
    config,
    originalJson,
    fileName,
    importConfig,
    exportConfig,
    restoreFromJson,
    getSnapshot,
    isDirty,
    coreNames,
    modifiedCoreCount,
  }
}
