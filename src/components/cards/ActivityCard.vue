<script setup lang="ts">
import { computed } from 'vue';
import type { ActivityCard as ActivityCardType } from '@/types/card';
import BaseCard from './BaseCard.vue';
import NavigateButton from '@/components/navigation/NavigateButton.vue';

interface Props {
  card: ActivityCardType;
  expanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
});

const emit = defineEmits<{
  toggle: [];
}>();

const locationName = computed(() => props.card.location?.name || '');
const details = computed(() => props.card.details);
</script>

<template>
  <BaseCard
    card-type="activity"
    :time="card.time"
    :end-time="card.endTime"
    :title="card.title"
    :subtitle="card.subtitle"
    :tags="card.tags"
    :expanded="expanded"
    @toggle="emit('toggle')"
  >
    <p v-if="locationName" class="location">
      <span class="location-icon">📍</span>
      {{ locationName }}
    </p>

    <template #details>
      <div class="activity-details">
        <div v-if="details.hours" class="detail-item">
          <span class="detail-label">營業時間</span>
          <span class="detail-value">{{ details.hours }}</span>
        </div>

        <div v-if="details.admission" class="detail-item">
          <span class="detail-label">入場費用</span>
          <div class="admission-list">
            <span v-for="(price, type) in details.admission" :key="type" class="admission-item">
              {{ type }}: {{ price }}
            </span>
          </div>
        </div>

        <div v-if="details.mustSee && details.mustSee.length" class="detail-item">
          <span class="detail-label">必看重點</span>
          <ul class="must-see-list">
            <li v-for="item in details.mustSee" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="details.tasks && details.tasks.length" class="detail-item">
          <span class="detail-label">待辦事項</span>
          <ul class="task-list">
            <li v-for="task in details.tasks" :key="task">{{ task }}</li>
          </ul>
        </div>

        <div v-if="details.tip" class="detail-item tip">
          <span class="tip-icon">💡</span>
          <span>{{ details.tip }}</span>
        </div>
      </div>
    </template>

    <template #actions>
      <NavigateButton v-if="card.navigationUrl" :url="card.navigationUrl" />
    </template>
  </BaseCard>
</template>

<style scoped>
.location {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0;
}

.location-icon {
  font-size: var(--font-size-md);
}

.activity-details {
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
  color: var(--color-activity);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.admission-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.admission-item {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.must-see-list,
.task-list {
  margin: 0;
  padding-left: var(--spacing-md);
}

.must-see-list li,
.task-list li {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.tip {
  flex-direction: row;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-activity-bg);
  border-radius: var(--radius-sm);
}

.tip-icon {
  font-size: var(--font-size-md);
}

.tip span:last-child {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}
</style>
