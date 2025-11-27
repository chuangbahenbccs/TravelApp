<script setup lang="ts">
interface Props {
  description: string;
  mapUrl?: string;
}

const props = defineProps<Props>();

function openMap() {
  if (props.mapUrl) {
    window.open(props.mapUrl, '_blank', 'noopener,noreferrer');
  }
}
</script>

<template>
  <section class="route-summary">
    <div class="route-header">
      <span class="route-icon">🗺️</span>
      <span class="route-label">今日路線</span>
    </div>
    <p class="route-description">{{ description }}</p>
    <button v-if="mapUrl" class="map-btn" @click="openMap">
      <span class="map-icon">📍</span>
      查看完整路線
    </button>
  </section>
</template>

<style scoped>
.route-summary {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.route-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.route-icon {
  font-size: var(--font-size-lg);
}

.route-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.route-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-md);
}

.map-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-height: var(--touch-target-min);
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

.map-btn:active {
  background: var(--color-activity);
  color: white;
}

.map-icon {
  font-size: var(--font-size-md);
}
</style>
