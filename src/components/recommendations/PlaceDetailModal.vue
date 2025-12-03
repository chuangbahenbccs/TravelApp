<script setup lang="ts">
/**
 * 地點詳情 Modal 元件
 *
 * 顯示推薦地點的完整資訊
 */
import { computed, watch, onMounted, onUnmounted } from 'vue';
import type { PlaceDetails } from '@/types/recommendation';
import {
  formatDistance,
  formatPriceLevel,
  convertRatingTo5Stars,
  generateNavigationUrl,
} from '@/types/recommendation';

interface Props {
  place: PlaceDetails | null;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<{
  close: [];
  navigate: [place: PlaceDetails];
}>();

// 是否顯示 Modal
const isVisible = computed(() => props.place !== null || props.isLoading);

// 評分星星
const ratingStars = computed(() => {
  if (!props.place?.rating) return '';
  const stars = convertRatingTo5Stars(props.place.rating);
  const fullStars = Math.floor(stars);
  const hasHalf = stars - fullStars >= 0.5;
  return '★'.repeat(fullStars) + (hasHalf ? '☆' : '');
});

const ratingText = computed(() => {
  if (!props.place?.rating) return '';
  return convertRatingTo5Stars(props.place.rating).toFixed(1);
});

// 營業狀態
const openStatus = computed(() => {
  if (!props.place?.hours?.isOpenNow) return null;
  return props.place.hours.isOpenNow ? '營業中' : '已打烊';
});

const openStatusClass = computed(() => {
  if (!props.place?.hours?.isOpenNow) return '';
  return props.place.hours.isOpenNow ? 'status-open' : 'status-closed';
});

// 類型標籤
const typeLabel = computed(() => {
  if (!props.place) return '';
  return props.place.type === 'restaurant' ? '餐廳' : '景點';
});

const typeClass = computed(() => {
  if (!props.place) return '';
  return props.place.type === 'restaurant' ? 'type-restaurant' : 'type-attraction';
});

// 處理關閉
function handleClose() {
  emit('close');
}

// 處理背景點擊關閉
function handleOverlayClick(event: Event) {
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    handleClose();
  }
}

// 開啟 Google Maps 導航
function openNavigation() {
  if (!props.place) return;
  const url = generateNavigationUrl(
    { latitude: props.place.latitude, longitude: props.place.longitude },
    props.place.name
  );
  window.open(url, '_blank');
}

// 開啟電話
function openPhone() {
  if (!props.place?.phone) return;
  window.open(`tel:${props.place.phone}`, '_self');
}

// 開啟網站
function openWebsite() {
  if (!props.place?.website) return;
  window.open(props.place.website, '_blank');
}

// ESC 鍵關閉
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isVisible.value) {
    handleClose();
  }
}

// 鎖定 body 滾動
watch(isVisible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="place-name">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="modal-loading">
            <div class="loading-spinner"></div>
            <p class="loading-text">載入中...</p>
          </div>

          <!-- 詳情內容 -->
          <template v-else-if="place">
            <!-- 關閉按鈕 -->
            <button class="close-btn" type="button" @click="handleClose" aria-label="關閉">
              <span class="close-icon">×</span>
            </button>

            <!-- 照片輪播 -->
            <div class="photo-section">
              <div v-if="place.photos && place.photos[0]" class="photo-carousel">
                <img
                  :src="place.photos[0].url"
                  :alt="place.name"
                  class="photo-main"
                />
              </div>
              <div v-else class="photo-placeholder">
                <span class="placeholder-icon">{{ place.type === 'restaurant' ? '🍽️' : '🏛️' }}</span>
              </div>

              <!-- 類型標籤 -->
              <span class="type-badge" :class="typeClass">{{ typeLabel }}</span>
            </div>

            <!-- 基本資訊 -->
            <div class="info-section">
              <h2 id="place-name" class="place-name">{{ place.name }}</h2>

              <!-- 類別 -->
              <div v-if="place.categories && place.categories[0]" class="place-category">
                {{ place.categories[0].name }}
              </div>

              <!-- 評分與價格 -->
              <div class="meta-row">
                <div v-if="place.rating" class="rating">
                  <span class="rating-stars">{{ ratingStars }}</span>
                  <span class="rating-text">{{ ratingText }}</span>
                </div>
                <span v-if="place.priceLevel" class="price">
                  {{ formatPriceLevel(place.priceLevel) }}
                </span>
                <span class="distance">{{ formatDistance(place.distance) }}</span>
              </div>

              <!-- 營業狀態 -->
              <div v-if="place.hours" class="hours-section">
                <span v-if="openStatus" class="open-status" :class="openStatusClass">
                  {{ openStatus }}
                </span>
                <span v-if="place.hours.display" class="hours-display">
                  {{ place.hours.display }}
                </span>
              </div>

              <!-- 描述 -->
              <p v-if="place.description" class="description">
                {{ place.description }}
              </p>

              <!-- 地址 -->
              <div v-if="place.address" class="address-row">
                <span class="address-icon">📍</span>
                <span class="address-text">{{ place.address }}</span>
              </div>

              <!-- 聯絡資訊 -->
              <div class="contact-section">
                <button
                  v-if="place.phone"
                  class="contact-btn"
                  type="button"
                  @click="openPhone"
                >
                  <span class="contact-icon">📞</span>
                  <span class="contact-text">{{ place.phone }}</span>
                </button>
                <button
                  v-if="place.website"
                  class="contact-btn"
                  type="button"
                  @click="openWebsite"
                >
                  <span class="contact-icon">🌐</span>
                  <span class="contact-text">官方網站</span>
                </button>
              </div>
            </div>

            <!-- 導航按鈕 -->
            <div class="action-section">
              <button class="navigate-btn" type="button" @click="openNavigation">
                <span class="navigate-icon">🧭</span>
                <span class="navigate-text">導航前往</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal 過場動畫 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(100%);
}

/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
}

/* Content */
.modal-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-lg);
}

/* Loading */
.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-divider);
  border-top-color: var(--color-activity);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Close Button */
.close-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.close-icon {
  font-size: 20px;
  color: #fff;
  line-height: 1;
}

/* Photo Section */
.photo-section {
  position: relative;
  width: 100%;
  height: 200px;
  background: var(--color-background);
}

.photo-carousel {
  width: 100%;
  height: 100%;
}

.photo-main {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-divider);
}

.placeholder-icon {
  font-size: 64px;
}

.type-badge {
  position: absolute;
  bottom: var(--spacing-md);
  left: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
}

.type-badge.type-restaurant {
  color: #fff;
  background: var(--color-restaurant);
}

.type-badge.type-attraction {
  color: #fff;
  background: var(--color-activity);
}

/* Info Section */
.info-section {
  padding: var(--spacing-lg);
}

.place-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
  line-height: var(--line-height-tight);
}

.place-category {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.rating-stars {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.rating-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.price {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.distance {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.hours-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.open-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
}

.open-status.status-open {
  color: var(--color-success);
  background: rgba(46, 204, 113, 0.1);
}

.open-status.status-closed {
  color: var(--color-error);
  background: rgba(231, 76, 60, 0.1);
}

.hours-display {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-md);
}

.address-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.address-icon {
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.address-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

/* Contact Section */
.contact-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.contact-btn:hover {
  background: var(--color-divider);
}

.contact-icon {
  font-size: var(--font-size-md);
}

.contact-text {
  font-size: var(--font-size-sm);
  color: var(--color-activity);
}

/* Action Section */
.action-section {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
  border-top: 1px solid var(--color-divider);
}

.navigate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md);
  min-height: var(--touch-target-min);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: #fff;
  background: var(--color-activity);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.navigate-btn:hover {
  background: var(--color-activity-light);
}

.navigate-btn:active {
  transform: scale(0.98);
}

.navigate-icon {
  font-size: var(--font-size-lg);
}

/* Desktop */
@media (min-width: 600px) {
  .modal-overlay {
    align-items: center;
  }

  .modal-content {
    border-radius: var(--radius-lg);
  }
}
</style>
