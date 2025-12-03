<script setup lang="ts">
/**
 * 類別篩選元件
 *
 * 提供全部/餐廳/景點的切換篩選
 */
import type { PlaceType } from '@/types/recommendation';

type FilterValue = PlaceType | 'all';

interface Props {
  modelValue: FilterValue;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterValue];
}>();

const filters: { value: FilterValue; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '📍' },
  { value: 'restaurant', label: '餐廳', icon: '🍽️' },
  { value: 'attraction', label: '景點', icon: '🏛️' },
];

function selectFilter(value: FilterValue) {
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="category-filter" role="tablist">
    <button
      v-for="filter in filters"
      :key="filter.value"
      type="button"
      role="tab"
      class="filter-btn"
      :class="{ active: modelValue === filter.value }"
      :aria-selected="modelValue === filter.value"
      @click="selectFilter(filter.value)"
    >
      <span class="filter-icon">{{ filter.icon }}</span>
      <span class="filter-label">{{ filter.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-lg);
}

.filter-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  min-height: var(--touch-target-min);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn:hover:not(.active) {
  background: var(--color-divider);
}

.filter-btn.active {
  color: var(--color-text-primary);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.filter-icon {
  font-size: var(--font-size-md);
}

.filter-label {
  white-space: nowrap;
}

/* 小螢幕隱藏文字 */
@media (max-width: 360px) {
  .filter-label {
    display: none;
  }

  .filter-btn {
    padding: var(--spacing-sm);
  }

  .filter-icon {
    font-size: var(--font-size-lg);
  }
}
</style>
