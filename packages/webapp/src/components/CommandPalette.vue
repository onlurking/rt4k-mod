<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import MiniSearch from 'minisearch'
import { useCommands } from '../composables/useCommands'
import type { SubPromptState } from '../composables/useCommands'
import type { CommandItem } from '../types'
import '../assets/command-palette.css'

const props = defineProps<{
  visible: boolean
  sidebarVisible: boolean
  showPreview: boolean
  triggerFileImport: () => void
}>()

const emit = defineEmits<{
  close: []
  'update:sidebar-visible': [value: boolean]
  'update:show-preview': [value: boolean]
}>()

const showPreviewProxy = computed({
  get: () => props.showPreview,
  set: (v: boolean) => emit('update:show-preview', v),
})

const sidebarProxy = computed({
  get: () => props.sidebarVisible,
  set: (v: boolean) => emit('update:sidebar-visible', v),
})

const { allCommands, getSubPrompt, applySubPromptValue } = useCommands(
  () => {
    emit('close')
    props.triggerFileImport()
  },
  showPreviewProxy,
  sidebarProxy,
)

// Sub-prompt state
const subPrompt = ref<SubPromptState | null>(null)
const subInputValue = ref('')
const subSelectValue = ref('')

// Search state
const searchQuery = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

// MiniSearch instance
interface IndexedCommand {
  id: string
  label: string
  keywords: string
}

const miniSearch = computed(() => {
  const ms = new MiniSearch<IndexedCommand>({
    fields: ['label', 'keywords'],
    storeFields: ['id'],
    searchOptions: {
      boost: { label: 2 },
      prefix: true,
      fuzzy: 0.3,
    },
  })
  ms.addAll(allCommands.value.map((cmd, i) => ({
    id: String(i),
    label: cmd.label,
    keywords: cmd.keywords || '',
  })))
  return ms
})

// Filtered commands
const filteredCommands = computed(() => {
  if (!searchQuery.value.trim()) return allCommands.value
  const results = miniSearch.value.search(searchQuery.value)
  return results.map(r => allCommands.value[Number(r.id)])
})

// Group order
const groupOrder = ['File', 'View', 'Settings'] as const

// Grouped filtered commands
const groupedFiltered = computed(() => {
  const groups: Record<string, CommandItem[]> = {}
  for (const cmd of filteredCommands.value) {
    if (!groups[cmd.group]) groups[cmd.group] = []
    groups[cmd.group].push(cmd)
  }
  return groups
})

// Flat list for keyboard navigation
const flatFiltered = computed(() => {
  const list: CommandItem[] = []
  for (const group of groupOrder) {
    if (groupedFiltered.value[group]) {
      list.push(...groupedFiltered.value[group])
    }
  }
  return list
})

// Reset when visibility changes
watch(() => props.visible, (v) => {
  if (v) {
    searchQuery.value = ''
    selectedIndex.value = 0
    subPrompt.value = null
    subInputValue.value = ''
    subSelectValue.value = ''
    nextTick(() => inputRef.value?.focus())
  }
})

// Reset index when search changes
watch(searchQuery, () => {
  selectedIndex.value = 0
})

function handleBackdropClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.classList.contains('palette-backdrop')) {
    emit('close')
  }
}

function selectCommand(cmd: CommandItem) {
  const sub = getSubPrompt(cmd.id)
  if (sub) {
    subPrompt.value = sub
    subInputValue.value = ''
    subSelectValue.value = sub.options?.[0] ?? ''
    nextTick(() => {
      const el = document.querySelector('.sub-input') as HTMLInputElement
      el?.focus()
    })
    return
  }
  cmd.action()
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (subPrompt.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, flatFiltered.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const cmd = flatFiltered.value[selectedIndex.value]
    if (cmd) selectCommand(cmd)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  }
}

function handleSubSubmit() {
  if (!subPrompt.value) return

  let value: string | number | boolean

  if (subPrompt.value.type === 'enum') {
    value = subSelectValue.value
  } else if (subPrompt.value.type === 'number') {
    value = Number(subInputValue.value)
    if (isNaN(value)) return
  } else {
    value = subInputValue.value
  }

  applySubPromptValue(subPrompt.value, value)
  subPrompt.value = null
  emit('close')
}

function handleSubBack() {
  subPrompt.value = null
  nextTick(() => inputRef.value?.focus())
}

function handleSubKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    handleSubBack()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    handleSubSubmit()
  }
}

function isItemSelected(cmd: CommandItem): boolean {
  const idx = flatFiltered.value.indexOf(cmd)
  return idx === selectedIndex.value
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="visible" class="palette-backdrop" @click="handleBackdropClick">
        <div class="palette-wrapper" @keydown="handleKeydown">
          <div class="palette-container">
            <!-- Sub-prompt header -->
            <div v-if="subPrompt" class="sub-prompt-header">
              <button class="btn-back" @click="handleSubBack">←</button>
              <span class="sub-label">{{ subPrompt.label }}</span>
            </div>

            <!-- Main input -->
            <div v-else class="palette-input-wrapper">
              <input
                ref="inputRef"
                v-model="searchQuery"
                class="palette-input"
                placeholder="Type a command or search…"
                spellcheck="false"
                autocomplete="off"
              />
            </div>

            <!-- Sub-prompt: Enum picker -->
            <div v-if="subPrompt?.type === 'enum'" class="palette-list">
              <div
                v-for="opt in subPrompt.options"
                :key="opt"
                class="palette-item"
                @click="applySubPromptValue(subPrompt!, opt); subPrompt = null; emit('close')"
              >
                {{ opt }}
              </div>
            </div>

            <!-- Sub-prompt: Number input -->
            <div v-else-if="subPrompt?.type === 'number'" class="command-sub-prompt">
              <label>{{ subPrompt.label }}</label>
              <input
                class="sub-input"
                type="number"
                v-model="subInputValue"
                placeholder="Enter value…"
                @keydown="handleSubKeydown"
              />
              <button class="btn-apply" @click="handleSubSubmit">Apply</button>
            </div>

            <!-- Sub-prompt: Text input -->
            <div v-else-if="subPrompt?.type === 'text'" class="command-sub-prompt">
              <label>{{ subPrompt.label }}</label>
              <input
                class="sub-input"
                type="text"
                v-model="subInputValue"
                placeholder="Enter value…"
                @keydown="handleSubKeydown"
              />
              <button class="btn-apply" @click="handleSubSubmit">Apply</button>
            </div>

            <!-- Main command list -->
            <div v-else class="palette-list">
              <template v-for="group in groupOrder" :key="group">
                <div v-if="groupedFiltered[group]?.length" class="palette-group">
                  <div class="palette-group-heading">{{ group }}</div>
                  <div
                    v-for="cmd in groupedFiltered[group]"
                    :key="cmd.id"
                    class="palette-item"
                    :class="{ 'palette-item-selected': isItemSelected(cmd) }"
                    @click="selectCommand(cmd)"
                    @mouseenter="selectedIndex = flatFiltered.indexOf(cmd)"
                  >
                    <span class="cmd-label">{{ cmd.label }}</span>
                    <span v-if="cmd.shortcut" class="command-shortcut">{{ cmd.shortcut }}</span>
                  </div>
                </div>
              </template>
              <div v-if="flatFiltered.length === 0" class="palette-empty">
                No results found.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(1, 1, 2, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: min(20vh, 180px);
}

.palette-wrapper {
  max-width: 520px;
  width: 100%;
  margin: 0 16px;
}

.palette-container {
  background: #111113;
  color: #f7f8f8;
  font: 13px/1.5 'Inter', -apple-system, system-ui, sans-serif;
  border: 1px solid #23252a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 70px rgba(0, 0, 0, 0.5);
}

.palette-input-wrapper {
  border-bottom: 1px solid #23252a;
}

.palette-input {
  width: 100%;
  background: transparent;
  border: none;
  padding: 14px 16px;
  font: 13px/1.5 'Inter', -apple-system, system-ui, sans-serif;
  color: #f7f8f8;
  outline: 0;
  box-sizing: border-box;
}

.palette-input::placeholder {
  color: #62666d;
}

.palette-list {
  max-height: 340px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0;
}

.palette-group-heading {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #62666d;
}

.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  margin: 0 4px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  color: #d0d6e0;
  transition: background 0.06s;
}

.palette-item:hover,
.palette-item-selected {
  background: #18181b;
  color: #f7f8f8;
}

.palette-empty {
  padding: 48px;
  text-align: center;
  color: #62666d;
  font-size: 13px;
}

.cmd-label {
  flex: 1;
}

.command-shortcut {
  color: #62666d;
  font-size: 11px;
  font-family: monospace;
  margin-left: 16px;
  white-space: nowrap;
  background: #18181b;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #23252a;
}

.sub-prompt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid #23252a;
}

.btn-back {
  background: transparent;
  border: 1px solid #23252a;
  color: #62666d;
  padding: 4px 8px;
  line-height: 1;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-back:hover {
  color: #f7f8f8;
  border-color: #3a3d44;
}

.sub-label {
  color: #62666d;
  font-size: 12px;
}

.command-sub-prompt {
  padding: 12px 16px;
}

.command-sub-prompt label {
  display: block;
  margin-bottom: 8px;
  color: #62666d;
  font-size: 12px;
}

.sub-input {
  width: 100%;
  margin-bottom: 8px;
  background: transparent;
  border: 1px solid #23252a;
  padding: 8px 12px;
  font: 13px/1.5 'Inter', -apple-system, system-ui, sans-serif;
  color: #f7f8f8;
  border-radius: 6px;
  outline: 0;
  box-sizing: border-box;
}

.sub-input:focus {
  border-color: #3a3d44;
}

.btn-apply {
  width: 100%;
  background: #23252a;
  border: none;
  color: #f7f8f8;
  padding: 8px 16px;
  font: 13px/1.5 'Inter', -apple-system, system-ui, sans-serif;
  border-radius: 6px;
  cursor: pointer;
}

.btn-apply:hover {
  background: #2a2d33;
}

/* Transitions */
.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
