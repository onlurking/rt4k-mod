<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import AppHeader from './components/AppHeader.vue'
import CoreList from './components/CoreList.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import JsonPreview from './components/JsonPreview.vue'
import CommandPalette from './components/CommandPalette.vue'
import { useProfile } from './composables/useProfile'
import { useHistory } from './composables/useHistory'

const { importConfig, exportConfig } = useProfile()

const sidebarVisible = ref(true)
const showPreview = ref(false)
const showPalette = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileImport() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importConfig(file).catch((err: Error) => alert(err.message))
  input.value = ''
}

// Global keydown — intercept browser shortcuts
function handleGlobalKeydown(e: KeyboardEvent) {
  const ctrl = e.ctrlKey || e.metaKey

  if (ctrl && e.key === 'k') {
    e.preventDefault()
    if (!showPalette.value) showPalette.value = true
    return
  }
  if (ctrl && e.key === 'o') {
    e.preventDefault()
    if (!showPalette.value) triggerFileImport()
    return
  }
  if (ctrl && e.key === 's') {
    e.preventDefault()
    if (!showPalette.value) exportConfig()
    return
  }
  if (ctrl && e.key === 'b') {
    e.preventDefault()
    if (!showPalette.value) sidebarVisible.value = !sidebarVisible.value
    return
  }
  if (ctrl && e.shiftKey && (e.key === 'p' || e.key === 'P')) {
    e.preventDefault()
    if (!showPalette.value) showPreview.value = !showPreview.value
    return
  }
  if (e.key === 'Escape' && showPalette.value) {
    e.preventDefault()
    showPalette.value = false
    return
  }

  // Ctrl+Z — undo
  if (ctrl && !e.shiftKey && e.key === 'z') {
    e.preventDefault()
    const { undo, canUndo } = useHistory()
    if (canUndo.value) undo()
    return
  }

  // Ctrl+Shift+Z — redo
  if (ctrl && e.shiftKey && e.key === 'z') {
    e.preventDefault()
    const { redo, canRedo } = useHistory()
    if (canRedo.value) redo()
    return
  }
}

onMounted(() => document.addEventListener('keydown', handleGlobalKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleGlobalKeydown))
</script>

<template>
  <div class="app-layout">
    <AppHeader
      @toggle-palette="showPalette = true"
      @toggle-preview="showPreview = !showPreview"
    />
    <Splitpanes class="app-body" style="flex: 1">
      <Pane v-if="sidebarVisible" :size="20" :min-size="12" :max-size="35" class="pane-sidebar">
        <CoreList />
      </Pane>
      <Pane :size="showPreview && sidebarVisible ? 55 : showPreview ? 60 : 100" class="pane-main">
        <SettingsPanel />
      </Pane>
      <Pane v-if="showPreview" :size="25" :min-size="15" class="pane-preview">
        <JsonPreview @close="showPreview = false" />
      </Pane>
    </Splitpanes>
    <CommandPalette
      :visible="showPalette"
      :sidebar-visible="sidebarVisible"
      :show-preview="showPreview"
      :trigger-file-import="triggerFileImport"
      @close="showPalette = false"
      @update:sidebar-visible="sidebarVisible = $event"
      @update:show-preview="showPreview = $event"
    />
    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileChange" />
  </div>
</template>

<style>
/* Override splitpanes default splitter style globally */
.splitpanes.app-body > .splitpanes__splitter {
  background: var(--hairline);
  border: none;
  position: relative;
  min-width: 1px;
}

.splitpanes.app-body > .splitpanes__splitter::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  height: 24px;
  background: var(--ink-tertiary);
  border-radius: 1px;
  opacity: 0;
  transition: opacity 0.15s;
}

.splitpanes.app-body > .splitpanes__splitter:hover::before {
  opacity: 1;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-body {
  border-top: 1px solid var(--hairline);
}

.pane-sidebar {
  background: var(--canvas);
  overflow-y: auto;
  overflow-x: hidden;
}

.pane-main {
  background: var(--canvas);
  overflow-y: auto;
  overflow-x: hidden;
}

.pane-preview {
  background: var(--canvas);
  overflow: hidden;
}
</style>
