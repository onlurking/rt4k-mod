<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import MiniSearch from 'minisearch'

interface Option {
  value: string
  label: string
  group?: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: 'Select…',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const highlightedIndex = ref(0)
const dropdownStyle = ref<Record<string, string>>({})

// MiniSearch with explicit idField
const ms = new MiniSearch({
  fields: ['label', 'group'],
  storeFields: ['label'],
  searchOptions: {
    boost: { label: 2 },
    prefix: true,
    fuzzy: 0.2,
  },
})

function rebuildIndex() {
  ms.removeAll()
  const docs = props.options.map((o, i) => ({
    id: i,
    label: o.label,
    group: o.group ?? '',
  }))
  ms.addAll(docs)
}

watch(() => props.options, rebuildIndex, { immediate: true })

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) return props.options
  const results = ms.search(searchQuery.value)
  return results.map(r => props.options[r.id as number])
})

const groupedOptions = computed(() => {
  const groups: Record<string, Option[]> = {}
  for (const opt of filteredOptions.value) {
    const g = opt.group ?? ''
    if (!groups[g]) groups[g] = []
    groups[g].push(opt)
  }
  return groups
})

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.label ?? props.modelValue ?? ''
})

function updatePosition() {
  const el = containerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  searchQuery.value = ''
  highlightedIndex.value = filteredOptions.value.findIndex(o => o.value === props.modelValue)
  if (highlightedIndex.value < 0) highlightedIndex.value = 0
  updatePosition()
  nextTick(() => searchInput.value?.focus())
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
}

function selectOption(opt: Option) {
  emit('update:modelValue', opt.value)
  close()
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      open()
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      scrollToHighlighted()
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter':
      e.preventDefault()
      if (filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      close()
      break
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const el = dropdownRef.value?.querySelector('.ac-highlighted')
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (containerRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return
  close()
}

function handleReposition() {
  if (isOpen.value) updatePosition()
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', handleReposition, true)
  window.addEventListener('resize', handleReposition)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', handleReposition, true)
  window.removeEventListener('resize', handleReposition)
})

watch(searchQuery, () => { highlightedIndex.value = 0 })
</script>

<template>
  <div ref="containerRef" class="ac" :class="{ open: isOpen, disabled }" @keydown="handleKeydown">
    <button class="ac-trigger" @click="isOpen ? close() : open()" :disabled="disabled" type="button">
      <span class="ac-value" :class="{ 'ac-placeholder': !modelValue }">
        {{ selectedLabel || placeholder }}
      </span>
      <svg class="ac-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="ac-drop">
        <div v-if="isOpen" ref="dropdownRef" class="ac-dropdown" :style="dropdownStyle">
          <div class="ac-search-wrap">
            <input
              ref="searchInput"
              v-model="searchQuery"
              class="ac-search"
              :placeholder="placeholder"
              spellcheck="false"
              autocomplete="off"
              @keydown="handleKeydown"
            />
          </div>
          <div class="ac-list" v-if="filteredOptions.length">
            <template v-for="(items, groupName) in groupedOptions" :key="groupName">
              <div v-if="Object.keys(groupedOptions).length > 1 && groupName" class="ac-group">{{ groupName }}</div>
              <div
                v-for="opt in items"
                :key="opt.value"
                class="ac-option"
                :class="{
                  'ac-selected': opt.value === modelValue,
                  'ac-highlighted': filteredOptions.indexOf(opt) === highlightedIndex
                }"
                @click="selectOption(opt)"
                @mouseenter="highlightedIndex = filteredOptions.indexOf(opt)"
              >
                {{ opt.label }}
              </div>
            </template>
          </div>
          <div v-else class="ac-empty">No results</div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ac {
  position: relative;
  display: inline-flex;
}

.ac-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  cursor: pointer;
  background: var(--surface-1);
  border: 1px solid var(--hairline);
  border-radius: var(--r-md);
  padding: 8px 32px 8px 12px;
  color: var(--ink);
  font: inherit;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  position: relative;
  transition: border-color 0.12s, box-shadow 0.12s;
}

.ac-trigger:hover { border-color: var(--hairline-strong); }

.ac.open .ac-trigger {
  border-color: var(--primary-focus);
  box-shadow: 0 0 0 3px var(--primary-muted);
}

.ac-trigger:disabled { opacity: 0.36; cursor: not-allowed; }

.ac-value {
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}

.ac-placeholder { color: var(--ink-tertiary); }

.ac-chevron {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-tertiary);
  transition: transform 0.15s;
  pointer-events: none;
}

.ac.open .ac-chevron { transform: translateY(-50%) rotate(180deg); }

/* ── Dropdown ── */
.ac-dropdown {
  background: var(--surface-1);
  border: 1px solid var(--hairline);
  border-radius: var(--r-lg);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 320px;
}

.ac-search-wrap {
  padding: 8px;
  border-bottom: 1px solid var(--hairline);
}

.ac-search {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--hairline);
  border-radius: var(--r-sm);
  padding: 7px 10px;
  color: var(--ink);
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.12s;
  box-sizing: border-box;
}

.ac-search::placeholder { color: var(--ink-tertiary); }
.ac-search:focus { border-color: var(--primary-focus); }

.ac-list {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0;
}

.ac-group {
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--ink-tertiary);
}

.ac-option {
  display: flex;
  align-items: center;
  padding: 7px 12px;
  margin: 0 4px;
  cursor: pointer;
  border-radius: var(--r-sm);
  font-size: 13px;
  color: var(--ink-muted);
  transition: background 0.06s;
  word-break: break-word;
}

.ac-option:hover,
.ac-highlighted {
  background: var(--surface-2);
  color: var(--ink);
}

.ac-selected { color: var(--primary); font-weight: 500; }
.ac-selected.ac-highlighted { color: var(--primary-hover); }

.ac-empty {
  padding: 32px;
  text-align: center;
  color: var(--ink-tertiary);
  font-size: 13px;
}

/* ── Transition ── */
.ac-drop-enter-active,
.ac-drop-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.ac-drop-enter-from,
.ac-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
