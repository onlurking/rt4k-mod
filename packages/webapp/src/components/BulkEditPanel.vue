<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditor } from '../composables/useEditor'
import { SCHEMA, getEnumOptions } from '../schema'
import { DataType } from '../types'
import AutocompleteSelect from './AutocompleteSelect.vue'

const { bulkSetSetting } = useEditor()

const selectedSetting = ref('')
const enumValue = ref('')
const numValue = ref(0)

const actionableSettings = SCHEMA.filter(
  (s) => !s.readOnly && (s.type === DataType.ENUM || s.type === DataType.SIGNED_INT || s.type === DataType.SIGNED_SHORT)
)

const settingOptions = computed(() =>
  actionableSettings.map(s => ({ value: s.name, label: s.desc }))
)

const currentDef = computed(() => SCHEMA.find((s) => s.name === selectedSetting.value))
const isEnum = computed(() => currentDef.value?.type === DataType.ENUM)
const isNum = computed(() => currentDef.value?.type === DataType.SIGNED_INT || currentDef.value?.type === DataType.SIGNED_SHORT)

const enumOptions = computed(() => {
  if (!selectedSetting.value) return []
  return getEnumOptions(selectedSetting.value).map(o => ({ value: o, label: o }))
})

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
    <AutocompleteSelect
      v-model="selectedSetting"
      :options="settingOptions"
      placeholder="Select setting…"
      @update:modelValue="onSettingChange"
    />
    <AutocompleteSelect
      v-if="isEnum"
      v-model="enumValue"
      :options="enumOptions"
      placeholder="Value…"
    />
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
</style>
