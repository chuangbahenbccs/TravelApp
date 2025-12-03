<script setup lang="ts">
/**
 * 推薦卡片元件
 *
 * 顯示單一推薦地點的卡片
 */
import type { PlaceSummary } from '@/types/recommendation';
import { formatDistance, formatPriceLevel, convertRatingTo5Stars } from '@/types/recommendation';

interface Props {
  place: PlaceSummary;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [place: PlaceSummary];
  navigate: [place: PlaceSummary];
}>();

function handleClick() {
  emit('click', props.place);
}

function handleNavigate(event: Event) {
  event.stopPropagation();
  emit('navigate', props.place);
}

function getTypeLabel(type: string): string {
  return type === 'restaurant' ? '餐廳' : '景點';
}

function getTypeClass(type: string): string {
  return type === 'restaurant' ? 'type-restaurant' : 'type-attraction';
}

function getRatingStars(rating?: number): string {
  if (!rating) return '';
  const stars = convertRatingTo5Stars(rating);
  const fullStars = Math.floor(stars);
  const hasHalf = stars - fullStars >= 0.5;
  return '★'.repeat(fullStars) + (hasHalf ? '☆' : '') + ` ${stars.toFixed(1)}`;
}
</script>

<template>
  <article class="recommendation-card" @click="handleClick">
    <div class="card-thumbnail">
      <img
        v-if="place.thumbnailUrl"
        :src="place.thumbnailUrl"
        :alt="place.name"
        loading="lazy"
      />
      <div v-else class="thumbnail-placeholder">
        <span>{{ place.type === 'restaurant' ? '🍽️' : '🏛️' }}</span>
      </div>
    </div>

    <div class="card-content">
      <div class="card-header">
        <span class="place-type" :class="getTypeClass(place.type)">
          {{ getTypeLabel(place.type) }}
        </span>
        <span class="place-distance">{{ formatDistance(place.distance) }}</span>
      </div>

      <h3 class="place-name">{{ place.name }}</h3>

      <div v-if="place.categories[0]" class="place-category">
        {{ place.categories[0].name }}
      </div>

      <div class="card-footer">
        <div class="place-meta">
          <span v-if="place.rating" class="place-rating">
            {{ getRatingStars(place.rating) }}
          </span>
          <span v-if="place.priceLevel" class="place-price">
            {{ formatPriceLevel(place.priceLevel) }}
          </span>
        </div>

        <button
          class="navigate-btn"
          type="button"
          @click="handleNavigate"
          aria-label="導航至此地點"
        >
          <span class="navigate-icon">🧭</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.recommendation-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
}

.recommendation-card:active {
  box-shadow: var(--shadow-card-hover);
}

.card-thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-divider);
}

.card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: var(--color-background);
}

.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.place-type {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-full);
}

.type-restaurant {
  color: var(--color-restaurant);
  background: var(--color-restaurant-bg);
}

.type-attraction {
  color: var(--color-activity);
  background: var(--color-activity-bg);
}

.place-distance {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.place-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.place-category {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--spacing-sm);
}

.place-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.place-rating {
  font-size: var(--font-size-xs);
  color: var(--color-warning);
}

.place-price {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.navigate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  background: var(--color-background);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.navigate-btn:hover {
  background: var(--color-divider);
}

.navigate-btn:active {
  transform: scale(0.95);
}

.navigate-icon {
  font-size: var(--font-size-lg);
}
</style>
