import { ref, computed } from 'vue'
import JSZip from 'jszip'
import type { ProfileConfig } from '../types'
import { fetchBaseProfile, applySettings } from '../lib/browser-profile'

interface ProfileEntry {
  name: string
  path: string
}

const config = ref<ProfileConfig | null>(null)
const originalJson = ref<string>('')
const fileName = ref<string>('')
const availableProfiles = ref<ProfileEntry[]>([])
const selectedProfile = ref<ProfileEntry | null>(null)
let loadPromise: Promise<void> | null = null

async function loadDefaultConfig(): Promise<void> {
  try {
    const res = await fetch('/default-config.json')
    if (!res.ok) return
    const parsed = await res.json() as ProfileConfig
    config.value = parsed
    originalJson.value = JSON.stringify(parsed, null, 2)
    fileName.value = 'profiles-standard.json'
  } catch {
    // silent fail — user can still import manually
  }
}

const DEFAULT_PROFILE_PATH = 'CRT TV and PVM Emulation by Kuro Houou/JVC D-Series-D200 - 4K HDR.rt4'

async function loadAvailableProfiles(): Promise<void> {
  try {
    const res = await fetch('/rt4k-profiles/manifest.json')
    if (!res.ok) return
    const profiles = await res.json() as ProfileEntry[]
    availableProfiles.value = profiles
    // Select default profile if none selected
    if (!selectedProfile.value && profiles.length > 0) {
      selectedProfile.value = profiles.find(p => p.path === DEFAULT_PROFILE_PATH) ?? profiles[0]
    }
  } catch {
    // silent fail — fallback to default base profile
  }
}

export function useProfile() {
  if (!loadPromise && !config.value) {
    loadPromise = loadDefaultConfig()
  }
  
  // Load available profiles on first use
  if (availableProfiles.value.length === 0) {
    loadAvailableProfiles()
  }
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

  const isGenerating = ref(false)
  const generateProgress = ref<{ current: number; total: number } | null>(null)

  async function downloadProfiles(): Promise<void> {
    if (!config.value || isGenerating.value) return
    isGenerating.value = true
    generateProgress.value = { current: 0, total: 0 }

    try {
      const baseUrl = selectedProfile.value 
        ? `/rt4k-profiles/${selectedProfile.value.path}`
        : '/base-profile.rt4'
      const baseProfile = await fetchBaseProfile(baseUrl)
      const { defaults, cores } = config.value

      const coreNames = Object.keys(cores).sort()
      generateProgress.value = { current: 0, total: coreNames.length }

      const zip = new JSZip()
      const dv1 = zip.folder('DV1')!

      for (let i = 0; i < coreNames.length; i++) {
        const coreName = coreNames[i]
        const coreSettings = cores[coreName]
        const merged = { ...defaults, ...(coreSettings ?? {}) }

        const profile = baseProfile.clone()
        applySettings(profile, merged)

        dv1.file(`${coreName}.rt4`, profile.toBytes())
        generateProgress.value = { current: i + 1, total: coreNames.length }

        // Yield to keep UI responsive
        if (i % 10 === 0) await new Promise(r => setTimeout(r, 0))
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'DV1.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Generation failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      isGenerating.value = false
      generateProgress.value = null
    }
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

  function selectProfile(profile: ProfileEntry): void {
    selectedProfile.value = profile
  }

  return {
    config,
    originalJson,
    fileName,
    importConfig,
    exportConfig,
    downloadProfiles,
    restoreFromJson,
    getSnapshot,
    isDirty,
    coreNames,
    modifiedCoreCount,
    isGenerating,
    generateProgress,
    availableProfiles,
    selectedProfile,
    selectProfile,
  }
}
