<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEditor } from '../composables/useEditor'
import { useProfile } from '../composables/useProfile'
import { useHistory } from '../composables/useHistory'
import { SETTING_GROUPS, getSettingDef } from '../schema'
import SettingField from './SettingField.vue'
import BulkEditPanel from './BulkEditPanel.vue'

const { config, restoreFromJson } = useProfile()
const { selectedCore, effectiveSettings, setSetting, resetSetting, resetCore } = useEditor()
const history = useHistory()

onMounted(() => {
  history.init(() => config.value, restoreFromJson)
})

const title = computed(() => selectedCore.value === 'defaults' ? 'Defaults' : selectedCore.value)
const isDefaults = computed(() => selectedCore.value === 'defaults')

function handleUpdate(settingPath: string, value: string | number | boolean) { setSetting(settingPath, value) }
function handleReset(settingPath: string) { resetSetting(settingPath) }
function handleResetCore() {
  if (selectedCore.value !== 'defaults') resetCore(selectedCore.value)
}
</script>

<template>
  <div class="settings-panel" v-if="config">
    <div class="panel-header">
      <h2>{{ title }}</h2>
      <div class="header-actions">
        <div class="undo-redo">
          <button class="btn-ghost btn-icon" @click="history.undo()" :disabled="!history.canUndo.value" :title="history.undoLabel.value ? `Undo: ${history.undoLabel.value}` : 'Undo'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          </button>
          <button class="btn-ghost btn-icon" @click="history.redo()" :disabled="!history.canRedo.value" :title="history.redoLabel.value ? `Redo: ${history.redoLabel.value}` : 'Redo'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
          </button>
        </div>
        <button v-if="!isDefaults" class="btn-ghost" @click="handleResetCore">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Reset core
        </button>
      </div>
    </div>

    <div class="settings-groups">
      <div v-for="group in SETTING_GROUPS" :key="group.label" class="settings-group">
        <h3 class="group-header">{{ group.label }}</h3>
        <SettingField
          v-for="name in group.settingNames"
          :key="name"
          :def="getSettingDef(name)"
          :value="effectiveSettings[name]"
          @update:value="handleUpdate(name, $event)"
          @reset="handleReset(name)"
        />
      </div>
    </div>

    <div v-if="isDefaults" class="bulk-section">
      <BulkEditPanel />
    </div>
  </div>

  <div v-else class="empty-state">
    <div class="empty-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    </div>
    <p class="empty-title">No config loaded</p>
    <p class="empty-hint">Import a JSON config to begin editing</p>
    <p class="empty-shortcut"><kbd>⌘O</kbd> or <kbd>⌘K</kbd> then "Import"</p>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-md) var(--sp-lg);
  border-bottom: 1px solid var(--hairline);
  position: sticky;
  top: 0;
  background: var(--canvas);
  z-index: 10;
  flex-shrink: 0;
}

h2 {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.05px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.undo-redo {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: var(--surface-1);
  border-radius: var(--r-md);
  border: 1px solid var(--hairline);
}

.btn-icon {
  padding: 6px !important;
  color: var(--ink-subtle);
  border: none !important;
  background: transparent !important;
}

.btn-icon:hover:not(:disabled) {
  color: var(--ink);
  background: var(--surface-2) !important;
}

.btn-icon:disabled {
  opacity: 0.3;
}

.group-header {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--ink-tertiary);
  padding: var(--sp-sm) var(--sp-lg) var(--sp-xs);
  margin: 0;
}

.settings-group {
  margin-bottom: var(--sp-xs);
}

.bulk-section {
  flex-shrink: 0;
  border-top: 1px solid var(--hairline);
  position: sticky;
  bottom: 0;
  background: var(--canvas);
  z-index: 10;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--sp-xs);
}

.empty-icon { margin-bottom: var(--sp-sm); }

.empty-title {
  color: var(--ink-muted);
  font-size: 15px;
  font-weight: 500;
}

.empty-hint {
  color: var(--ink-tertiary);
  font-size: 13px;
}

.empty-shortcut {
  color: var(--ink-tertiary);
  font-size: 12px;
  margin-top: var(--sp-xs);
}

.empty-shortcut kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--surface-1);
  padding: 2px 6px;
  border-radius: var(--r-xs);
  border: 1px solid var(--hairline);
}
</style>
