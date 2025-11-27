<script setup lang="ts">
import type { CardType } from '@/types';

interface Props {
  cardType: CardType;
  time: string;
  endTime?: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  expanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
});

const emit = defineEmits<{
  toggle: [];
}>();

function handleClick() {
  emit('toggle');
}
</script>

<template>
  <article
    class="base-card"
    :class="[`card-${props.cardType}`, { expanded: props.expanded }]"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="card-time">
        <span class="time-start">{{ props.time }}</span>
        <span v-if="props.endTime" class="time-end">~ {{ props.endTime }}</span>
      </div>
      <div class="card-indicator" :class="`indicator-${props.cardType}`"></div>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ props.title }}</h3>
      <p v-if="props.subtitle" class="card-subtitle">{{ props.subtitle }}</p>

      <div v-if="props.tags && props.tags.length > 0" class="card-tags">
        <span v-for="tag in props.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>

    <div class="card-content">
      <slot></slot>
    </div>

    <div v-if="$slots.details && props.expanded" class="card-details">
      <slot name="details"></slot>
    </div>

    <div v-if="$slots.actions" class="card-actions">
      <slot name="actions"></slot>
    </div>
  </article>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  transition: box-shadow var(--transition-normal);
  cursor: pointer;
}

.base-card:active {
  box-shadow: var(--shadow-card-hover);
}

.card-activity {
  border-left: 4px solid var(--color-activity);
}

.card-restaurant {
  border-left: 4px solid var(--color-restaurant);
}

.card-transport {
  border-left: 4px solid var(--color-transport);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-bottom: 0;
}

.card-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.time-start {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.time-end {
  margin-left: var(--spacing-xs);
}

.card-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.indicator-activity { background: var(--color-activity); }
.indicator-restaurant { background: var(--color-restaurant); }
.indicator-transport { background: var(--color-transport); }

.card-body {
  padding: var(--spacing-sm) var(--spacing-md);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0 0;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--spacing-sm);
  font-size: var(--font-size-xs);
  background: var(--color-divider);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.card-content {
  padding: 0 var(--spacing-md);
}

.card-content:empty {
  display: none;
}

.card-details {
  padding: var(--spacing-md);
  padding-top: 0;
  animation: slideDown var(--transition-expand);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--color-divider);
}
</style>
