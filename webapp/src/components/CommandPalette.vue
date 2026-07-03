<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { Command } from 'vue-command-palette'
import { useCommands } from '../composables/useCommands'
import type { SubPromptState } from '../composables/useCommands'
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


// Reset sub-prompt when palette closes
watch(() => props.visible, (v) => {
  if (!v) {
    subPrompt.value = null
    subInputValue.value = ''
    subSelectValue.value = ''
  }
})

// Commands that trigger sub-prompts vs direct actions
const mainCommands = computed(() =>
  allCommands.value.filter((cmd) => !getSubPrompt(cmd.id))
)

const subPromptCommands = computed(() =>
  allCommands.value.filter((cmd) => !!getSubPrompt(cmd.id))
)

// All displayable commands
const displayCommands = computed(() => [
  ...mainCommands.value,
  ...subPromptCommands.value,
])

// Grouped
const groupOrder = ['Navigation', 'File', 'View', 'Settings', 'Bulk Edit'] as const

const groupedDisplay = computed(() => {
  const groups: Record<string, typeof displayCommands.value> = {}
  for (const cmd of displayCommands.value) {
    if (!groups[cmd.group]) groups[cmd.group] = []
    groups[cmd.group].push(cmd)
  }
  return groups
})

// Handle item selection from vue-command-palette
function handleSelect(item: any) {
  const cmdId = item?.value || item?.id || ''
  const cmd = displayCommands.value.find((c) => c.id === cmdId)
  if (!cmd) return

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
</script>

<template>
  <Command.Dialog
    :visible="visible"
    theme="linear"
    @select-item="handleSelect"
  >
    <template #header>
      <div v-if="subPrompt" class="sub-prompt-header">
        <button class="btn-back" @click="handleSubBack">←</button>
        <span class="sub-label">{{ subPrompt.label }}</span>
      </div>
      <Command.Input
        v-else
        placeholder="Type a command or search…"
      />
    </template>
    <template #body>
      <!-- Sub-prompt: Enum picker -->
      <div v-if="subPrompt?.type === 'enum'" class="command-sub-prompt">
        <Command.List>
          <Command.Empty>No options.</Command.Empty>
          <Command.Item
            v-for="opt in subPrompt.options"
            :key="opt"
            :data-value="opt"
          >
            {{ opt }}
          </Command.Item>
        </Command.List>
      </div>

      <!-- Sub-prompt: Number input -->
      <div v-else-if="subPrompt?.type === 'number'" class="command-sub-prompt">
        <label>{{ subPrompt.label }}</label>
        <input
          ref="subInputRef"
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
          ref="subInputRef"
          class="sub-input"
          type="text"
          v-model="subInputValue"
          placeholder="Enter value…"
          @keydown="handleSubKeydown"
        />
        <button class="btn-apply" @click="handleSubSubmit">Apply</button>
      </div>

      <!-- Main command list -->
      <Command.List v-else>
        <Command.Empty>No results found.</Command.Empty>
        <template v-for="group in groupOrder" :key="group">
          <Command.Group
            v-if="groupedDisplay[group]?.length"
            :heading="group"
          >
            <Command.Item
              v-for="cmd in groupedDisplay[group]"
              :key="cmd.id"
              :data-value="cmd.id"
            >
              <span class="cmd-label">{{ cmd.label }}</span>
              <span v-if="cmd.shortcut" class="command-shortcut">{{ cmd.shortcut }}</span>
            </Command.Item>
          </Command.Group>
          <Command.Separator
            v-if="groupedDisplay[group]?.length"
          />
        </template>
      </Command.List>
    </template>
  </Command.Dialog>
</template>

<style scoped>
.cmd-label {
  flex: 1;
}

.command-shortcut {
  color: var(--ink-tertiary);
  font-size: 11px;
  font-family: var(--font-mono);
  margin-left: var(--sp-md);
  white-space: nowrap;
  background: var(--surface-1);
  padding: 2px 6px;
  border-radius: var(--r-xs);
  border: 1px solid var(--hairline);
}

.sub-prompt-header {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: 14px 16px;
  border-bottom: 1px solid var(--hairline);
}

.btn-back {
  background: transparent;
  border: 1px solid var(--hairline);
  color: var(--ink-subtle);
  padding: 4px 8px;
  line-height: 1;
  font-size: 14px;
  border-radius: var(--r-sm);
}

.btn-back:hover {
  color: var(--ink);
  border-color: var(--hairline-strong);
}

.sub-label {
  color: var(--ink-tertiary);
  font-size: 12px;
}

.command-sub-prompt {
  padding: var(--sp-sm) 16px;
}

.command-sub-prompt label {
  display: block;
  margin-bottom: var(--sp-xs);
  color: var(--ink-tertiary);
  font-size: 12px;
}

.sub-input {
  width: 100%;
  margin-bottom: var(--sp-xs);
}

.btn-apply {
  width: 100%;
}
</style>
