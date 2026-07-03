<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditor } from '../composables/useEditor'
import { SCHEMA, getEnumOptions } from '../schema'
import { DataType } from '../types'

const { bulkSetSetting } = useEditor()

const selectedSetting = ref('')
const enumValue = ref('')
const numValue = ref(0)

const actionableSettings = SCHEMA.filter(
  (s) => !s.readOnly && (s.type === DataType.ENUM || s.type === DataType.SIGNED_INT || s.type === DataType.SIGNED_SHORT)
)

const currentDef = computed(() => SCHEMA.find((s) => s.name === selectedSetting.value))
const isEnum = computed(() => currentDef.value?.type === DataType.ENUM)
const isNum = computed(() => currentDef.value?.type === DataType.SIGNED_INT || currentDef.value?.type === DataType.SIGNED_SHORT)

function applyBulk() {
  if (!selectedSetting.value) return
  if (isEnum.value) bulkSetSetting(selectedSetting.value, enumValue.value)
  else if (isNum.value) bulkSetSetting(selectedSetting.value, numValue.value)
}

function onSettingChange() {
  enumValue.value = ''
  numValue.value = 0
}
</script>

<template>
  <div class="bulk-panel">
    <span class="bulk-label">Bulk Edit</span>
    <select v-model="selectedSetting" @change="onSettingChange">
      <option value="" disabled>Select setting…</option>
      <option v-for="def in actionableSettings" :key="def.name" :value="def.name">{{ def.desc }}</option>
    </select>
    <select v-if="isEnum" v-model="enumValue">
      <option value="" disabled>Value…</option>
      <option v-for="opt in getEnumOptions(selectedSetting)" :key="opt" :value="opt">{{ opt }}</option>
    </select>
    <input v-else-if="isNum" v-model.number="numValue" type="number" placeholder="Value" />
    <button class="btn-primary" @click="applyBulk" :disabled="!selectedSetting || (isEnum && !enumValue)">Apply to all</button>
  </div>
</template>

<style scoped>
.bulk-panel {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-sm) var(--sp-lg);
}

.bulk-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-tertiary);
  flex-shrink: 0;
}

.bulk-panel select {
  max-width: 300px;
}
</style>
