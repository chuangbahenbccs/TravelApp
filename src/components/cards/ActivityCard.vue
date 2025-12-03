<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ActivityCard as ActivityCardType } from '@/types/card';
import BaseCard from './BaseCard.vue';
import NavigateButton from '@/components/navigation/NavigateButton.vue';
import { createFoursquareProvider } from '@/services/places/FoursquarePlacesProvider';

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

const router = useRouter();
const isLoadingNearby = ref(false);

const locationName = computed(() => props.card.location?.name || '');
const locationAddress = computed(() => props.card.location?.address || '');
const details = computed(() => props.card.details);

async function handleNearbyClick(event: Event) {
  event.stopPropagation();
  if (isLoadingNearby.value) return;

  const query = locationName.value || locationAddress.value;
  if (!query) return;

  isLoadingNearby.value = true;
  try {
    const provider = createFoursquareProvider();
    const result = await provider.geocode({ query });
    if (result) {
      router.push({
        path: `/nearby/${result.coordinates.latitude}/${result.coordinates.longitude}`,
        query: { name: locationName.value },
      });
    }
  } catch (error) {
    console.error('Geocode failed:', error);
  } finally {
    isLoadingNearby.value = false;
  }
}
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
      <button
        v-if="locationName"
        type="button"
        class="nearby-btn"
        :disabled="isLoadingNearby"
        @click="handleNearbyClick"
      >
        <span v-if="isLoadingNearby" class="loading-spinner"></span>
        <span v-else class="nearby-icon">📍</span>
        <span class="nearby-text">附近推薦</span>
      </button>
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

/* 附近推薦按鈕 */
.nearby-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-right: var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-activity);
  background: var(--color-activity-bg);
  border: 1px solid var(--color-activity-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
}

.nearby-btn:hover:not(:disabled) {
  background: var(--color-activity-light);
  color: var(--color-surface);
  border-color: var(--color-activity-light);
}

.nearby-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.nearby-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.nearby-icon {
  font-size: var(--font-size-sm);
}

.nearby-text {
  white-space: nowrap;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-activity-border);
  border-top-color: var(--color-activity);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
