<script setup lang="ts">
/**
 * 附近推薦頁面
 *
 * 顯示附近餐廳與景點推薦，支援清單/地圖切換與詳情查看
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNearbyRecommendations } from '@/composables/useNearbyRecommendations';
import CategoryFilter from '@/components/recommendations/CategoryFilter.vue';
import RecommendationList from '@/components/recommendations/RecommendationList.vue';
import RecommendationMap from '@/components/recommendations/RecommendationMap.vue';
import PlaceDetailModal from '@/components/recommendations/PlaceDetailModal.vue';
import type { PlaceSummary, PlaceDetails } from '@/types/recommendation';
import { generateNavigationUrl } from '@/types/recommendation';

interface Props {
  lat: number;
  lng: number;
  locationName?: string;
  placeId?: string;
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();

// 檢視模式：list | map
type ViewMode = 'list' | 'map';
const viewMode = ref<ViewMode>('list');
const mapLoadError = ref(false);

const {
  filteredPlaces,
  activeFilter,
  isLoading,
  hasError,
  isEmpty,
  isFromCache,
  cacheAge,
  error,
  selectedPlace,
  isLoadingDetails,
  searchNearby,
  setFilter,
  refresh,
  getPlaceDetails,
  clearSelectedPlace,
} = useNearbyRecommendations();

// 計算中心點座標
const centerCoordinates = computed(() => ({
  latitude: props.lat,
  longitude: props.lng,
}));

function handleBack() {
  router.back();
}

function handleFilterChange(filter: typeof activeFilter.value) {
  setFilter(filter);
}

function handleSelectPlace(place: PlaceSummary) {
  // 更新 URL 以支援直接連結
  router.replace({
    path: `/nearby/${props.lat}/${props.lng}/${place.id}`,
    query: { name: props.locationName },
  });
  // 取得詳情
  getPlaceDetails(place.id);
}

function handleCloseModal() {
  clearSelectedPlace();
  // 移除 placeId 從 URL
  router.replace({
    path: `/nearby/${props.lat}/${props.lng}`,
    query: { name: props.locationName },
  });
}

function handleNavigate(place: PlaceSummary | PlaceDetails) {
  const url = generateNavigationUrl(
    { latitude: place.latitude, longitude: place.longitude },
    place.name
  );
  window.open(url, '_blank');
}

function handleRefresh() {
  refresh();
}

function handleRetry() {
  searchNearby({ latitude: props.lat, longitude: props.lng }, props.locationName);
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'list' ? 'map' : 'list';
}

function handleMapError() {
  mapLoadError.value = true;
  viewMode.value = 'list';
}

onMounted(() => {
  searchNearby({ latitude: props.lat, longitude: props.lng }, props.locationName);
});

// 監聽座標變化
watch(
  () => ({ lat: props.lat, lng: props.lng }),
  (newCoords) => {
    searchNearby({ latitude: newCoords.lat, longitude: newCoords.lng }, props.locationName);
  }
);

// 監聽 placeId 變化（支援直接連結）
watch(
  () => props.placeId,
  (newPlaceId) => {
    if (newPlaceId && !selectedPlace.value) {
      getPlaceDetails(newPlaceId);
    }
  },
  { immediate: true }
);

// 監聽路由變化，確保從詳情返回時清除選取
watch(
  () => route.params.placeId,
  (newPlaceId) => {
    if (!newPlaceId && selectedPlace.value) {
      clearSelectedPlace();
    }
  }
);
</script>

<template>
  <main class="nearby-view page">
    <!-- 標頭 -->
    <header class="nearby-header">
      <button class="back-btn" type="button" @click="handleBack" aria-label="返回">
        <span class="back-icon">←</span>
      </button>
      <div class="header-content">
        <h1 class="header-title">附近推薦</h1>
        <p v-if="locationName" class="header-location">📍 {{ locationName }}</p>
      </div>
      <div class="header-actions">
        <!-- 清單/地圖切換按鈕 -->
        <button
          v-if="!isLoading && !hasError && !isEmpty && !mapLoadError"
          class="view-toggle-btn"
          type="button"
          @click="toggleViewMode"
          :aria-label="viewMode === 'list' ? '切換到地圖' : '切換到清單'"
        >
          <span class="toggle-icon">{{ viewMode === 'list' ? '🗺️' : '📋' }}</span>
        </button>
        <button
          v-if="!isLoading"
          class="refresh-btn"
          type="button"
          @click="handleRefresh"
          aria-label="重新整理"
        >
          <span class="refresh-icon">↻</span>
        </button>
      </div>
    </header>

    <!-- 快取提示 -->
    <div v-if="isFromCache && cacheAge" class="cache-notice">
      <span class="cache-icon">📦</span>
      <span class="cache-text">來自快取 · {{ cacheAge }}</span>
    </div>

    <!-- 類別篩選 -->
    <CategoryFilter
      :model-value="activeFilter"
      @update:model-value="handleFilterChange"
    />

    <!-- 載入狀態 -->
    <RecommendationList
      v-if="isLoading"
      :places="[]"
      :is-loading="true"
    />

    <!-- 錯誤狀態 -->
    <div v-else-if="hasError" class="error-state">
      <span class="error-icon">⚠️</span>
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" type="button" @click="handleRetry">
        重新載入
      </button>
    </div>

    <!-- 空結果狀態 -->
    <div v-else-if="isEmpty" class="empty-state">
      <span class="empty-icon">🔍</span>
      <p class="empty-message">附近沒有找到推薦地點</p>
      <p class="empty-hint">試試擴大搜尋範圍或更換位置</p>
    </div>

    <!-- 推薦清單 -->
    <RecommendationList
      v-else-if="viewMode === 'list'"
      :places="filteredPlaces"
      @select="handleSelectPlace"
      @navigate="handleNavigate"
    />

    <!-- 地圖檢視 -->
    <div v-else class="map-container">
      <RecommendationMap
        :places="filteredPlaces"
        :center="centerCoordinates"
        @select-place="handleSelectPlace"
        @navigate="handleNavigate"
        @error="handleMapError"
      />
    </div>

    <!-- 詳情 Modal -->
    <PlaceDetailModal
      :place="selectedPlace"
      :is-loading="isLoadingDetails"
      @close="handleCloseModal"
      @navigate="handleNavigate"
    />
  </main>
</template>

<style scoped>
.nearby-view {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  padding-top: calc(var(--spacing-md) + env(safe-area-inset-top, 0px));
  padding-bottom: calc(var(--spacing-xl) + env(safe-area-inset-bottom, 0px));
  min-height: 100vh;
  background: var(--color-background);
}

/* Header */
.nearby-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.back-btn,
.refresh-btn,
.view-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  background: var(--color-surface);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover,
.refresh-btn:hover,
.view-toggle-btn:hover {
  background: var(--color-divider);
}

.back-btn:active,
.refresh-btn:active,
.view-toggle-btn:active {
  transform: scale(0.95);
}

.back-icon,
.refresh-icon,
.toggle-icon {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.header-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.header-location {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Cache Notice */
.cache-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
  background: var(--color-activity-bg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-activity);
}

.cache-icon {
  font-size: var(--font-size-sm);
}

/* Category Filter */
.category-filter {
  margin-bottom: var(--spacing-lg);
}

/* Map Container */
.map-container {
  flex: 1;
  min-height: 400px;
  margin-top: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow: hidden;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.error-message {
  font-size: var(--font-size-md);
  color: var(--color-error);
  margin: 0 0 var(--spacing-lg);
}

.retry-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  min-height: var(--touch-target-min);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-surface);
  background: var(--color-activity);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.retry-btn:hover {
  background: var(--color-activity-light);
}

.retry-btn:active {
  transform: scale(0.98);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-message {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
