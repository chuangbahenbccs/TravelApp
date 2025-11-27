<script setup lang="ts">
import { computed } from 'vue';
import type { TransportCard as TransportCardType } from '@/types/card';
import BaseCard from './BaseCard.vue';
import NavigateButton from '@/components/navigation/NavigateButton.vue';

interface Props {
  card: TransportCardType;
  expanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
});

const emit = defineEmits<{
  toggle: [];
}>();

const details = computed(() => props.card.details);
</script>

<template>
  <BaseCard
    card-type="transport"
    :time="card.time"
    :end-time="card.endTime"
    :title="card.title"
    :subtitle="card.subtitle"
    :location="card.location"
    :tags="card.tags"
    :expanded="expanded"
    @toggle="emit('toggle')"
  >
    <div class="transport-info">
      <div class="quick-info">
        <span v-if="details.transportation" class="info-badge transport-type">
          {{ details.transportation }}
        </span>
        <span v-if="details.duration" class="info-badge duration">
          🕐 {{ details.duration }}
        </span>
      </div>
      <p v-if="card.routeDescription" class="route-desc">{{ card.routeDescription }}</p>
    </div>

    <template #details>
      <div class="transport-details">
        <div v-if="details.route" class="detail-item">
          <span class="detail-label">路線</span>
          <span class="detail-value route">{{ details.route }}</span>
        </div>

        <div v-if="details.fare" class="detail-item">
          <span class="detail-label">票價</span>
          <span class="detail-value fare">{{ details.fare }}</span>
        </div>

        <div v-if="details.flightNo" class="detail-item">
          <span class="detail-label">航班編號</span>
          <span class="detail-value flight">{{ details.flightNo }}</span>
        </div>

        <div v-if="details.feature" class="detail-item">
          <span class="detail-label">特點</span>
          <span class="detail-value">{{ details.feature }}</span>
        </div>

        <div v-if="details.note" class="detail-item note">
          <span class="note-icon">📝</span>
          <span>{{ details.note }}</span>
        </div>
      </div>
    </template>

    <template #actions>
      <NavigateButton v-if="card.navigationUrl" :url="card.navigationUrl" />
    </template>
  </BaseCard>
</template>

<style scoped>
.transport-info {
  margin: var(--spacing-sm) 0;
}

.quick-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.info-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--spacing-sm);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
}

.transport-type {
  background: var(--color-transport-bg);
  color: var(--color-transport);
  font-weight: var(--font-weight-medium);
}

.duration {
  background: var(--color-divider);
  color: var(--color-text-secondary);
}

.route-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.transport-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-transport);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.route {
  padding: var(--spacing-sm);
  background: var(--color-transport-bg);
  border-radius: var(--radius-sm);
  font-family: monospace;
}

.fare {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.flight {
  font-family: monospace;
  font-weight: var(--font-weight-bold);
  letter-spacing: 1px;
}

.note {
  flex-direction: row;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-warning);
  background: rgba(243, 156, 18, 0.1);
  border-radius: var(--radius-sm);
}

.note-icon {
  font-size: var(--font-size-md);
}

.note span:last-child {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}
</style>
