<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { RestaurantCard as RestaurantCardType } from '@/types/card';
import BaseCard from './BaseCard.vue';
import NavigateButton from '@/components/navigation/NavigateButton.vue';
import { createFoursquareProvider } from '@/services/places/FoursquarePlacesProvider';

interface Props {
  card: RestaurantCardType;
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
const hasBackup = computed(() => props.card.backup && props.card.backup.length > 0);

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
    card-type="restaurant"
    :time="card.time"
    :end-time="card.endTime"
    :title="card.title"
    :subtitle="card.subtitle"
    :tags="card.tags"
    :expanded="expanded"
    @toggle="emit('toggle')"
  >
    <div class="restaurant-info">
      <p v-if="locationName" class="location">
        <span class="location-icon">📍</span>
        {{ locationName }}
      </p>
      <div class="quick-info">
        <span v-if="details.cuisine" class="info-badge cuisine">{{ details.cuisine }}</span>
        <span v-if="details.priceRange" class="info-badge price">{{ details.priceRange }}</span>
      </div>
    </div>

    <template #details>
      <div class="restaurant-details">
        <div v-if="details.businessHours" class="detail-item">
          <span class="detail-label">營業時間</span>
          <span class="detail-value">{{ details.businessHours }}</span>
        </div>

        <div v-if="details.vegetarianOption" class="detail-item vegetarian">
          <span class="vegetarian-icon">🥬</span>
          <span class="detail-value">素食選項: {{ details.vegetarianOption }}</span>
        </div>

        <div v-if="details.mustOrder && details.mustOrder.length" class="detail-item">
          <span class="detail-label">推薦必點</span>
          <ul class="must-order-list">
            <li v-for="item in details.mustOrder" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="details.reservation" class="detail-item">
          <span class="detail-label">預約資訊</span>
          <span class="detail-value reservation">{{ details.reservation }}</span>
        </div>

        <div v-if="details.feature" class="detail-item">
          <span class="detail-label">特色</span>
          <span class="detail-value">{{ details.feature }}</span>
        </div>

        <div v-if="hasBackup" class="backup-section">
          <span class="detail-label">備用餐廳</span>
          <div class="backup-list">
            <div v-for="backup in card.backup" :key="backup.name" class="backup-item">
              <span class="backup-name">{{ backup.name }}</span>
              <span class="backup-desc">{{ backup.description }}</span>
            </div>
          </div>
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
/* 附近推薦按鈕 */
.nearby-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-right: var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-restaurant);
  background: var(--color-restaurant-bg);
  border: 1px solid var(--color-restaurant-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
}

.nearby-btn:hover:not(:disabled) {
  background: var(--color-restaurant-light);
  color: var(--color-surface);
  border-color: var(--color-restaurant-light);
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
  border: 2px solid var(--color-restaurant-border);
  border-top-color: var(--color-restaurant);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.restaurant-info {
  margin: var(--spacing-sm) 0;
}

.location {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm);
}

.location-icon {
  font-size: var(--font-size-md);
}

.quick-info {
  display: flex;
  gap: var(--spacing-sm);
}

.info-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--spacing-sm);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
}

.cuisine {
  background: var(--color-restaurant-bg);
  color: var(--color-restaurant);
}

.price {
  background: var(--color-divider);
  color: var(--color-text-secondary);
}

.restaurant-details {
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
  color: var(--color-restaurant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.vegetarian {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: #E8F5E9;
  border-radius: var(--radius-sm);
}

.vegetarian-icon {
  font-size: var(--font-size-md);
}

.must-order-list {
  margin: 0;
  padding-left: var(--spacing-md);
}

.must-order-list li {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.reservation {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-restaurant-bg);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.backup-section {
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--color-border);
}

.backup-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.backup-item {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-sm);
}

.backup-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.backup-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
