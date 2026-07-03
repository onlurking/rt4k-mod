<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProfile } from '../composables/useProfile'
import { useEditor } from '../composables/useEditor'
import CoreListItem from './CoreListItem.vue'

const { coreNames } = useProfile()
const { selectedCore, selectCore, isCoreModified, getCoreChangeCount } = useEditor()

const search = ref('')

const filteredCores = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return coreNames.value
  return coreNames.value.filter((name) => name.toLowerCase().includes(q))
})
</script>

<template>
  <div class="core-list">
    <div class="search-wrap">
      <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input v-model="search" type="search" placeholder="Filter cores…" class="search-input" />
    </div>
    <div class="list-scroll">
      <CoreListItem label="Defaults" :active="selectedCore === 'defaults'" :modified="false" @click="selectCore('defaults')" />
      <CoreListItem
        v-for="name in filteredCores"
        :key="name"
        :label="name"
        :active="selectedCore === name"
        :modified="isCoreModified(name)"
        :change-count="getCoreChangeCount(name)"
        @click="selectCore(name)"
      />
    </div>
  </div>
</template>

<style scoped>
.core-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-wrap {
  position: relative;
  padding: var(--sp-sm);
  border-bottom: 1px solid var(--hairline);
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding-left: 32px;
  border: none;
  background: var(--surface-1);
  font-size: 13px;
}

.search-input:focus {
  box-shadow: none;
}

.list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-xs) 0;
}
</style>
