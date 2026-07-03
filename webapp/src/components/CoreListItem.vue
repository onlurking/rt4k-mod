<script setup lang="ts">
defineProps<{
  label: string
  active: boolean
  modified: boolean
}>()
</script>

<template>
  <div class="core-item" :class="{ active, modified }" @click="$emit('click')">
    <span class="label">{{ label }}</span>
    <span v-if="modified" class="modified-dot"></span>
  </div>
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

.modified-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
  margin-left: var(--sp-xs);
}
</style>
