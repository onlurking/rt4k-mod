<script setup lang="ts">
import { computed } from 'vue'
import { useProfile } from '../composables/useProfile'

const emit = defineEmits<{ close: [] }>()
const { config, originalJson, exportConfig } = useProfile()

interface DiffLine {
  type: 'same' | 'add' | 'remove' | 'key'
  text: string
}

function deepDiff(
  orig: Record<string, any>,
  curr: Record<string, any>,
  path: string[] = [],
): DiffLine[] {
  const lines: DiffLine[] = []
  const allKeys = new Set([...Object.keys(orig), ...Object.keys(curr)])

  for (const key of allKeys) {
    const fullPath = [...path, key]
    const dotted = fullPath.join('.')
    const inOrig = key in orig
    const inCurr = key in curr

    if (!inOrig && inCurr) {
      appendValue(lines, dotted, curr[key], 'add')
    } else if (inOrig && !inCurr) {
      appendValue(lines, dotted, orig[key], 'remove')
    } else {
      const oVal = orig[key]
      const cVal = curr[key]

      // Special case: cores map — show core name as header
      if (dotted === 'cores' && typeof oVal === 'object' && typeof cVal === 'object') {
        lines.push(...diffCores(oVal ?? {}, cVal ?? {}))
      } else if (
        typeof oVal === 'object' && oVal !== null &&
        typeof cVal === 'object' && cVal !== null &&
        !Array.isArray(oVal) && !Array.isArray(cVal)
      ) {
        lines.push(...deepDiff(oVal, cVal, fullPath))
      } else if (JSON.stringify(oVal) !== JSON.stringify(cVal)) {
        appendValue(lines, dotted, oVal, 'remove')
        appendValue(lines, dotted, cVal, 'add')
      }
    }
  }

  return lines
}

function diffCores(
  orig: Record<string, any>,
  curr: Record<string, any>,
): DiffLine[] {
  const lines: DiffLine[] = []
  const allCores = new Set([...Object.keys(orig), ...Object.keys(curr)])

  for (const core of Array.from(allCores).sort()) {
    const oVal = orig[core] ?? null
    const cVal = curr[core] ?? null

    if (JSON.stringify(oVal) === JSON.stringify(cVal)) continue

    const header = `cores.${core}`

    // Core added
    if (oVal === null && cVal !== null) {
      lines.push({ type: 'add', text: `+ ${header}:` })
      for (const [k, v] of Object.entries(cVal)) {
        lines.push({ type: 'add', text: `    ${k}: ${JSON.stringify(v)}` })
      }
      continue
    }

    // Core removed
    if (oVal !== null && cVal === null) {
      lines.push({ type: 'remove', text: `- ${header}:` })
      for (const [k, v] of Object.entries(oVal)) {
        lines.push({ type: 'remove', text: `    ${k}: ${JSON.stringify(v)}` })
      }
      continue
    }

    // Core modified — show only changed settings
    const oObj = oVal ?? {} as Record<string, any>
    const cObj = cVal ?? {} as Record<string, any>
    const allKeys = new Set([...Object.keys(oObj), ...Object.keys(cObj)])
    let headerShown = false

    for (const setting of allKeys) {
      const oSetting = oObj[setting]
      const cSetting = cObj[setting]

      if (JSON.stringify(oSetting) === JSON.stringify(cSetting)) continue

      if (!headerShown) {
        lines.push({ type: 'key', text: `  ${header}:` })
        headerShown = true
      }

      if (!(setting in oObj)) {
        lines.push({ type: 'add', text: `    + ${setting}: ${JSON.stringify(cSetting)}` })
      } else if (!(setting in cObj)) {
        lines.push({ type: 'remove', text: `    - ${setting}: ${JSON.stringify(oSetting)}` })
      } else {
        lines.push({ type: 'remove', text: `    - ${setting}: ${JSON.stringify(oSetting)}` })
        lines.push({ type: 'add', text: `    + ${setting}: ${JSON.stringify(cSetting)}` })
      }
    }
  }

  return lines
}

function appendValue(lines: DiffLine[], key: string, val: any, type: 'add' | 'remove') {
  const prefix = type === 'add' ? '+ ' : '- '
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    lines.push({ type, text: `${prefix}${key}: {` })
    for (const [k, v] of Object.entries(val)) {
      lines.push({ type, text: `  ${k}: ${JSON.stringify(v)},` })
    }
    lines.push({ type, text: '  }' })
  } else {
    lines.push({ type, text: `${prefix}${key}: ${JSON.stringify(val)}` })
  }
}

const diffLines = computed<DiffLine[]>(() => {
  if (!config.value) return []
  try {
    const orig = JSON.parse(originalJson.value)
    const curr = config.value
    const changes = deepDiff(orig, curr)
    if (changes.length === 0) return []
    return changes
  } catch {
    return []
  }
})

const hasChanges = computed(() => diffLines.value.length > 0)
const changedCores = computed(() => {
  const cores: string[] = []
  for (const line of diffLines.value) {
    if (line.type === 'key' && line.text.startsWith('  cores.')) {
      cores.push(line.text.trim().replace('cores.', '').replace(':', ''))
    } else if ((line.type === 'add' || line.type === 'remove') && line.text.includes('cores.')) {
      const match = line.text.match(/cores\.([^\s:]+)/)
      if (match && !cores.includes(match[1])) cores.push(match[1])
    }
  }
  return cores.sort()
})

function copyToClipboard() {
  if (config.value) navigator.clipboard.writeText(JSON.stringify(config.value, null, 2))
}
</script>

<template>
  <div class="preview-panel">
    <div class="preview-header">
      <div class="preview-title">
        <h3>Diff</h3>
        <span v-if="changedCores.length" class="change-count">{{ changedCores.length }} {{ changedCores.length === 1 ? 'core' : 'cores' }}: {{ changedCores.join(', ') }}</span>
        <span v-else-if="hasChanges" class="change-count">defaults changed</span>
        <span v-else class="change-count">no changes</span>
      </div>
      <div class="preview-actions">
        <button class="btn-ghost btn-icon" @click="copyToClipboard" title="Copy to clipboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="btn-ghost btn-icon" @click="exportConfig()" title="Export">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="btn-ghost btn-icon" @click="$emit('close')" title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
    <div class="preview-body">
      <div v-if="!hasChanges" class="no-changes">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.15"><polyline points="20 6 9 17 4 12"/></svg>
        <span>No changes</span>
      </div>
      <pre v-else class="diff-content"><code><template v-for="(line, idx) in diffLines" :key="idx"><span :class="['diff-line', `diff-${line.type}`]">{{ line.text + '\n' }}</span></template></code></pre>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-sm) var(--sp-md);
  border-bottom: 1px solid var(--hairline);
  flex-shrink: 0;
  background: var(--canvas);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

h3 { font-size: 13px; font-weight: 600; }

.change-count {
  font-size: 11px;
  color: var(--ink-tertiary);
  font-family: var(--font-mono);
}

.preview-actions { display: flex; gap: 2px; }

.btn-icon { padding: 6px; color: var(--ink-tertiary); }
.btn-icon:hover { color: var(--ink); }

.preview-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.diff-content {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
  padding: var(--sp-xs) 0;
  white-space: pre;
}

.diff-line {
  display: block;
  padding: 0 var(--sp-md);
}

.diff-add {
  background: rgba(39, 166, 68, 0.06);
  color: var(--success);
}

.diff-remove {
  background: rgba(239, 68, 68, 0.06);
  color: #ef4444;
}

.diff-key {
  color: var(--ink-muted);
  font-weight: 500;
}

.no-changes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--sp-xs);
  color: var(--ink-tertiary);
  font-size: 13px;
}
</style>
