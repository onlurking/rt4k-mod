<script setup lang="ts">
import { computed } from 'vue'
import { useProfile } from '../composables/useProfile'
import AutocompleteSelect from './AutocompleteSelect.vue'

const emit = defineEmits<{
  'toggle-palette': []
  'toggle-preview': []
}>()

const { 
  fileName, 
  isDirty, 
  config, 
  modifiedCoreCount, 
  exportConfig, 
  downloadProfiles, 
  isGenerating, 
  generateProgress,
  availableProfiles,
  selectedProfile,
  selectProfile,
} = useProfile()

const profileOptions = computed(() => 
  availableProfiles.value.map(p => ({ value: p.path, label: p.name }))
)
const selectedProfilePath = computed({
  get: () => selectedProfile.value?.path ?? '',
  set: (v: string) => {
    const p = availableProfiles.value.find(p => p.path === v)
    if (p) selectProfile(p)
  }
})
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <h1>rt4k-mod</h1>
      <span v-if="fileName" class="filename">{{ fileName }}</span>
      <span v-if="isDirty" class="dirty-dot" title="Unsaved changes"></span>
      <AutocompleteSelect
        v-if="availableProfiles.length > 0"
        v-model="selectedProfilePath"
        :options="profileOptions"
        placeholder="Base profile…"
        class="profile-selector"
      />
    </div>
    <div class="header-right">
      <button class="btn-ghost palette-btn" @click="$emit('toggle-palette')" title="Command Palette (Ctrl+K)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <kbd>⌘K</kbd>
      </button>
      <button class="btn-ghost" @click="$emit('toggle-preview')" :disabled="!config">Preview</button>
      <button class="btn-ghost" @click="exportConfig()" :disabled="!config">Export</button>
      <button class="btn-primary btn-download" @click="downloadProfiles()" :disabled="!config || isGenerating">
        <span v-if="isGenerating" class="spinner"></span>
        {{ isGenerating ? `Generating ${generateProgress?.current}/${generateProgress?.total}` : 'Download' }}
      </button>
      <span v-if="config" class="core-count">{{ modifiedCoreCount }} modified</span>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--sp-md);
  background: var(--canvas);
  border-bottom: 1px solid var(--hairline);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

h1 {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.05px;
}

.filename {
  color: var(--ink-tertiary);
  font-size: 12px;
  padding: 2px 8px;
  background: var(--surface-1);
  border-radius: var(--r-xs);
  font-family: var(--font-mono);
}

.dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.palette-btn {
  gap: var(--sp-xs);
}

.palette-btn kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-tertiary);
  background: var(--surface-1);
  padding: 2px 6px;
  border-radius: var(--r-xs);
  border: 1px solid var(--hairline);
  line-height: 1;
}

.core-count {
  color: var(--ink-tertiary);
  font-size: 12px;
  margin-left: var(--sp-xs);
}

.profile-selector {
  margin-left: var(--sp-xs);
  max-width: 680px;
}

.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
