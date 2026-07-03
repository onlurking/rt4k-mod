<script setup lang="ts">
import { computed } from 'vue'
import { DataType, type SettingDef } from '../types'
import { useProfile } from '../composables/useProfile'
import { useEditor } from '../composables/useEditor'
import AutocompleteSelect from './AutocompleteSelect.vue'

const props = defineProps<{
  def: SettingDef
  value: string | number | boolean | undefined
}>()

const emit = defineEmits<{
  'update:value': [value: string | number | boolean]
  reset: []
}>()

const { config } = useProfile()
const { selectedCore } = useEditor()

const isModified = computed(() => {
  if (!config.value || selectedCore.value === 'defaults') return false
  const core = config.value.cores[selectedCore.value]
  if (!core) return false
  return props.def.name in core
})

const displayValue = computed(() => props.value === undefined ? '' : String(props.value))

const enumOptions = computed(() => {
  if (props.def.type !== DataType.ENUM || !props.def.enums) return []
  return props.def.enums.map(e => ({ value: e.name, label: e.name }))
})

const selectWidth = computed(() => {
  if (props.def.type !== DataType.ENUM || !props.def.enums) return {}
  const longest = props.def.enums.reduce((max, e) => Math.max(max, e.name.length), 0)
  const px = Math.max(120, longest * 8 + 48)
  return { width: px + 'px' }
})

function onEnumChange(v: string) { emit('update:value', v) }
function onNumberChange(e: Event) { emit('update:value', Number((e.target as HTMLInputElement).value)) }
function onBoolChange(e: Event) { emit('update:value', (e.target as HTMLInputElement).checked) }
function onTextChange(e: Event) { emit('update:value', (e.target as HTMLInputElement).value) }
</script>

<template>
  <div class="setting-field" :class="{ modified: isModified }">
    <label class="setting-label" :title="def.name">{{ def.desc }}</label>
    <div class="setting-control">
      <AutocompleteSelect
        v-if="def.type === DataType.ENUM && def.enums"
        :modelValue="displayValue"
        :options="enumOptions"
        @update:modelValue="onEnumChange"
        :style="selectWidth"
      />

      <div v-else-if="def.type === DataType.BIT" class="checkbox-wrap">
        <input type="checkbox" :checked="!!value" @change="onBoolChange" />
        <span></span>
      </div>

      <input v-else-if="def.type === DataType.SIGNED_INT || def.type === DataType.SIGNED_SHORT" type="number" :value="displayValue" @change="onNumberChange" />
      <input v-else-if="def.type === DataType.STR" type="text" :value="displayValue" @change="onTextChange" />

      <button v-if="isModified" class="btn-reset btn-ghost" @click="$emit('reset')" title="Reset to default">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.setting-field {
  display: flex;
  align-items: center;
  padding: 6px var(--sp-md);
  border-left: 2px solid transparent;
  transition: background 0.08s;
}

.setting-field:hover { background: var(--surface-1); }

.setting-field.modified { border-left-color: var(--primary); }

.setting-label {
  flex: 1 1 auto;
  color: var(--ink-muted);
  font-size: 13px;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: var(--sp-md);
}

.setting-control {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  flex: 0 0 auto;
  margin-left: auto;
}

.setting-control input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.setting-control input[type="number"]::-webkit-inner-spin-button,
.setting-control input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.setting-control input[type="text"] {
  flex: 0 0 auto;
  width: 300px;
}

.btn-reset {
  padding: 4px;
  color: var(--ink-tertiary);
  border: none;
  background: transparent;
}

.btn-reset:hover {
  color: var(--ink);
  background: transparent;
}
</style>
