<script setup lang="ts">
interface Props {
  url: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '導航',
});

function handleNavigate(event: Event) {
  event.stopPropagation();
  window.open(props.url, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <button class="navigate-btn" @click="handleNavigate" type="button">
    <span class="navigate-icon">🧭</span>
    <span class="navigate-label">{{ label }}</span>
  </button>
</template>

<style scoped>
.navigate-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-activity);
  background: var(--color-activity-bg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.navigate-btn:active {
  background: var(--color-activity);
  color: white;
  transform: scale(0.98);
}

.navigate-icon {
  font-size: var(--font-size-md);
}

.navigate-label {
  white-space: nowrap;
}
</style>
