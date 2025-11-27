<script setup lang="ts">
interface Props {
  currentDay: number;
  totalDays: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  change: [day: number];
}>();

function selectDay(day: number) {
  if (day >= 1 && day <= props.totalDays && day !== props.currentDay) {
    emit('change', day);
  }
}

function goToPrevious() {
  if (props.currentDay > 1) {
    emit('change', props.currentDay - 1);
  }
}

function goToNext() {
  if (props.currentDay < props.totalDays) {
    emit('change', props.currentDay + 1);
  }
}
</script>

<template>
  <nav class="day-selector">
    <button
      class="nav-btn prev"
      :disabled="currentDay <= 1"
      @click="goToPrevious"
      aria-label="前一天"
    >
      ‹
    </button>

    <div class="day-tabs hide-scrollbar">
      <button
        v-for="day in totalDays"
        :key="day"
        class="day-tab"
        :class="{ active: day === currentDay }"
        @click="selectDay(day)"
      >
        Day {{ day }}
      </button>
    </div>

    <button
      class="nav-btn next"
      :disabled="currentDay >= totalDays"
      @click="goToNext"
      aria-label="下一天"
    >
      ›
    </button>
  </nav>
</template>

<style scoped>
.day-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm) 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.nav-btn:not(:disabled):active {
  background: var(--color-activity-bg);
  color: var(--color-activity);
  border-color: var(--color-activity);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.day-tabs {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  flex: 1;
  padding: var(--spacing-xs) 0;
}

.day-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 36px;
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.day-tab:active {
  transform: scale(0.98);
}

.day-tab.active {
  background: var(--color-activity);
  color: white;
  border-color: var(--color-activity);
  font-weight: var(--font-weight-semibold);
}
</style>
