import { ref, computed } from 'vue'
import type { ProfileConfig } from '../types'

interface HistoryEntry {
  label: string
  snapshot: string // JSON stringified config
}

const undoStack = ref<HistoryEntry[]>([])
const redoStack = ref<HistoryEntry[]>([])

let _getConfig: (() => ProfileConfig | null) | null = null
let _restoreConfig: ((snapshot: string) => void) | null = null

export function useHistory() {
  function init(
    getConfig: () => ProfileConfig | null,
    restoreConfig: (snapshot: string) => void,
  ) {
    _getConfig = getConfig
    _restoreConfig = restoreConfig
  }

  function snapshot(label: string) {
    if (!_getConfig) return
    const config = _getConfig()
    if (!config) return
    undoStack.value.push({
      label,
      snapshot: JSON.stringify(config),
    })
    redoStack.value = []
  }

  function undo() {
    if (!_getConfig || !_restoreConfig) return
    const entry = undoStack.value.pop()
    if (!entry) return

    // Save current state to redo
    const current = _getConfig()
    if (current) {
      redoStack.value.push({
        label: entry.label,
        snapshot: JSON.stringify(current),
      })
    }

    _restoreConfig(entry.snapshot)
  }

  function redo() {
    if (!_getConfig || !_restoreConfig) return
    const entry = redoStack.value.pop()
    if (!entry) return

    // Save current state to undo
    const current = _getConfig()
    if (current) {
      undoStack.value.push({
        label: entry.label,
        snapshot: JSON.stringify(current),
      })
    }

    _restoreConfig(entry.snapshot)
  }

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)
  const undoLabel = computed(() => {
    const entry = undoStack.value[undoStack.value.length - 1]
    return entry ? entry.label : ''
  })
  const redoLabel = computed(() => {
    const entry = redoStack.value[redoStack.value.length - 1]
    return entry ? entry.label : ''
  })

  function clear() {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    init,
    snapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    clear,
  }
}
