<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useProfile } from '../composables/useProfile'

const props = defineProps<{
  label: string
  active: boolean
  modified: boolean
  changeCount?: number
}>()

const { config } = useProfile()
const showPopover = ref(false)
const badgeRef = ref<HTMLElement | null>(null)
const popoverStyle = ref({})
let hideTimeout: ReturnType<typeof setTimeout> | null = null

interface Change {
  key: string
  defaultVal: string
  coreVal: string
}

const changes = ref<Change[]>([])

function updatePosition() {
  if (!badgeRef.value) return
  const rect = badgeRef.value.getBoundingClientRect()
  const top = rect.top - 8
  const left = rect.right + 8
  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    transform: 'translateY(-100%)',
  }
}

function showChanges() {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  if (!config.value || !props.modified) return
  const core = config.value.cores[props.label]
  if (!core) return
  changes.value = Object.entries(core).map(([key, val]) => ({
    key,
    defaultVal: JSON.stringify(config.value!.defaults[key] ?? '—'),
    coreVal: JSON.stringify(val),
  }))
  updatePosition()
  showPopover.value = true
}

function hideChanges() {
  hideTimeout = setTimeout(() => {
    showPopover.value = false
  }, 150)
}

function cancelHide() {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

// Position popover on scroll
function handleScroll() {
  if (showPopover.value) updatePosition()
}

onMounted(() => {
  const scrollContainer = document.querySelector('.pane-sidebar')
  scrollContainer?.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  const scrollContainer = document.querySelector('.pane-sidebar')
  scrollContainer?.removeEventListener('scroll', handleScroll, true)
})
</script>

<template>
  <div class="core-item" :class="{ active, modified }" @click="$emit('click')">
    <span class="label">{{ label }}</span>
    <span
      v-if="modified"
      ref="badgeRef"
      class="modified-badge"
      @mouseenter="showChanges"
      @mouseleave="hideChanges"
    >
      <span class="modified-dot"></span>
    </span>
  </div>
  <Teleport to="body">
    <Transition name="popover">
      <div
        v-if="showPopover"
        class="core-popover"
        :style="popoverStyle"
        @mouseenter="cancelHide"
        @mouseleave="hideChanges"
      >
        <div class="popover-header">{{ changeCount }} change{{ changeCount !== 1 ? 's' : '' }}</div>
        <div class="popover-changes">
          <div v-for="c in changes" :key="c.key" class="change-row">
            <span class="change-key">{{ c.key }}</span>
            <span class="change-diff">
              <span class="change-old">{{ c.defaultVal }}</span>
              <span class="change-arrow">→</span>
              <span class="change-new">{{ c.coreVal }}</span>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.core-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px var(--sp-md);
  margin: 1px var(--sp-xs);
  cursor: pointer;
  border-radius: var(--r-sm);
  font-size: 13px;
  color: var(--ink-subtle);
  transition: background 0.08s, color 0.08s;
}

.core-item:hover {
  background: var(--surface-1);
  color: var(--ink-muted);
}

.core-item.active {
  background: var(--primary-muted);
  color: var(--ink);
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modified-badge {
  position: relative;
  padding: 12px;
  margin: -6px;
  cursor: default;
}

.modified-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
  display: block;
}
</style>

<style>
.core-popover {
  position: fixed;
  z-index: 10001;
  background: #111113;
  border: 1px solid #23252a;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  font: 12px/1.5 'Inter', -apple-system, system-ui, sans-serif;
  color: #f7f8f8;
  min-width: 240px;
  max-width: 360px;
  max-height: 300px;
  overflow-y: auto;
  pointer-events: auto;
}

.popover-header {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #62666d;
  border-bottom: 1px solid #23252a;
}

.popover-changes {
  padding: 4px 0;
}

.change-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 3px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.change-key {
  color: #62666d;
  flex-shrink: 0;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-diff {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}

.change-old {
  color: #ef4444;
  text-decoration: line-through;
  opacity: 0.7;
}

.change-arrow {
  color: #62666d;
  flex-shrink: 0;
}

.change-new {
  color: #27a644;
}

.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(2px);
}
</style>
