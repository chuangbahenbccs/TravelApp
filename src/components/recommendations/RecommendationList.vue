<script setup lang="ts">
/**
 * 推薦清單元件
 *
 * 顯示推薦地點清單，支援載入狀態
 */
import type { PlaceSummary } from '@/types/recommendation';
import RecommendationCard from './RecommendationCard.vue';

interface Props {
  places: PlaceSummary[];
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<{
  select: [place: PlaceSummary];
  navigate: [place: PlaceSummary];
}>();

function handleSelect(place: PlaceSummary) {
  emit('select', place);
}

function handleNavigate(place: PlaceSummary) {
  emit('navigate', place);
}
</script>

<template>
  <div class="recommendation-list">
    <!-- 載入狀態 -->
    <template v-if="isLoading">
      <div v-for="i in 3" :key="i" class="skeleton-card">
        <div class="skeleton-thumbnail skeleton"></div>
        <div class="skeleton-content">
          <div class="skeleton-header">
            <div class="skeleton-type skeleton"></div>
            <div class="skeleton-distance skeleton"></div>
          </div>
          <div class="skeleton-name skeleton"></div>
          <div class="skeleton-category skeleton"></div>
          <div class="skeleton-footer">
            <div class="skeleton-meta skeleton"></div>
            <div class="skeleton-btn skeleton"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- 推薦清單 -->
    <template v-else>
      <RecommendationCard
        v-for="place in places"
        :key="place.id"
        :place="place"
        @click="handleSelect"
        @navigate="handleNavigate"
      />
    </template>
  </div>
</template>

<style scoped>
.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Skeleton Loading */
.skeleton-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-divider) 25%,
    var(--color-background) 50%,
    var(--color-divider) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-xs);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
}

.skeleton-type {
  width: 48px;
  height: 18px;
}

.skeleton-distance {
  width: 40px;
  height: 14px;
}

.skeleton-name {
  width: 70%;
  height: 20px;
}

.skeleton-category {
  width: 50%;
  height: 14px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.skeleton-meta {
  width: 80px;
  height: 14px;
}

.skeleton-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
}
</style>
