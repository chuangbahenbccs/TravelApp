<script setup lang="ts">
/**
 * 附近推薦按鈕元件
 *
 * 在行程卡片上顯示「附近推薦」按鈕，點擊後導向推薦頁面
 */
import { useRouter } from 'vue-router';

interface Props {
  /** 地點名稱 */
  locationName: string;
  /** 緯度 */
  latitude: number;
  /** 經度 */
  longitude: number;
}

const props = defineProps<Props>();
const router = useRouter();

function handleClick(event: Event) {
  event.stopPropagation();
  router.push({
    path: `/nearby/${props.latitude}/${props.longitude}`,
    query: { name: props.locationName },
  });
}
</script>

<template>
  <button
    class="nearby-button"
    type="button"
    @click="handleClick"
    aria-label="查看附近推薦"
  >
    <span class="nearby-icon">📍</span>
    <span class="nearby-text">附近推薦</span>
  </button>
</template>

<style scoped>
.nearby-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
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

.nearby-button:hover {
  background: var(--color-activity-light);
  color: var(--color-surface);
  border-color: var(--color-activity-light);
}

.nearby-button:active {
  transform: scale(0.96);
}

.nearby-icon {
  font-size: var(--font-size-sm);
}

.nearby-text {
  white-space: nowrap;
}
</style>
