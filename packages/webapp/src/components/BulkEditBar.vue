<script setup lang="ts">
import { ref } from 'vue'
import { useProfile } from '../composables/useProfile'
import { useEditor } from '../composables/useEditor'
import { SCHEMA, getEnumOptions } from '../schema'
import { DataType } from '../types'

const { coreNames } = useProfile()
const { bulkSetSetting } = useEditor()

const selectedSetting = ref('')
const enumValue = ref('')
const numValue = ref(0)
const showBar = ref(false)

const actionableSettings = SCHEMA.filter(
  (s) => !s.readOnly && (s.type === DataType.ENUM || s.type === DataType.SIGNED_INT)
)

function applyBulk() {
  if (!selectedSetting.value) return
  const def = SCHEMA.find((s) => s.name === selectedSetting.value)
  if (!def) return
  if (!confirm(`Apply ${selectedSetting.value} to ${coreNames.value.length} cores?`)) return
  if (def.type === DataType.ENUM) bulkSetSetting(selectedSetting.value, enumValue.value)
  else if (def.type === DataType.SIGNED_INT) bulkSetSetting(selectedSetting.value, numValue.value)
  showBar.value = false
}
</script>

<template>
  <div class="bulk-edit-bar">
    <button v-if="!showBar" @click="showBar = true" class="btn-ghost">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Bulk Edit…
    </button>
    <div v-else class="bulk-form">
      <select v-model="selectedSetting">
        <option value="" disabled>Select setting…</option>
        <option v-for="def in actionableSettings" :key="def.name" :value="def.name">{{ def.desc }}</option>
      </select>
      <select v-if="selectedSetting && SCHEMA.find(s => s.name === selectedSetting)?.type === DataType.ENUM" v-model="enumValue">
        <option value="" disabled>Value…</option>
        <option v-for="opt in getEnumOptions(selectedSetting)" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      <input v-else-if="selectedSetting && SCHEMA.find(s => s.name === selectedSetting)?.type === DataType.SIGNED_INT" v-model.number="numValue" type="number" placeholder="Value" />
      <button class="btn-primary" @click="applyBulk" :disabled="!selectedSetting">Apply to all</button>
      <button class="btn-ghost" @click="showBar = false">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.bulk-edit-bar {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  background: var(--surface-1);
  border-top: 1px solid var(--hairline);
  padding: var(--sp-sm) var(--sp-lg);
  z-index: 50;
}

.bulk-form {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.bulk-form select {
  width: auto;
  max-width: 400px;
}
</style>
