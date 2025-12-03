<script setup lang="ts">
/**
 * 推薦地圖元件
 *
 * 使用 Leaflet + OpenStreetMap 顯示推薦地點
 */
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { PlaceSummary, Coordinates } from '@/types/recommendation';
import { formatDistance } from '@/types/recommendation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Props {
  places: PlaceSummary[];
  center: Coordinates;
  selectedPlaceId?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  selectPlace: [place: PlaceSummary];
  navigate: [place: PlaceSummary];
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let markers: L.Marker[] = [];
let centerMarker: L.Marker | null = null;

// 自定義圖標
function createIcon(type: 'restaurant' | 'attraction' | 'center'): L.DivIcon {
  const iconMap = {
    restaurant: '🍽️',
    attraction: '🏛️',
    center: '📍',
  };
  const colorMap = {
    restaurant: '#E67E22',
    attraction: '#3498DB',
    center: '#E74C3C',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-icon" style="background-color: ${colorMap[type]}"><span>${iconMap[type]}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

// 初始化地圖
function initMap() {
  if (!mapContainer.value || map) return;

  map = L.map(mapContainer.value, {
    center: [props.center.latitude, props.center.longitude],
    zoom: 15,
    zoomControl: false,
  });

  // 添加 OpenStreetMap 圖層
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // 添加縮放控制到右下角
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // 添加中心點標記
  addCenterMarker();

  // 添加地點標記
  addPlaceMarkers();
}

// 添加中心點標記
function addCenterMarker() {
  if (!map) return;

  if (centerMarker) {
    centerMarker.remove();
  }

  centerMarker = L.marker([props.center.latitude, props.center.longitude], {
    icon: createIcon('center'),
    zIndexOffset: 1000,
  }).addTo(map);

  centerMarker.bindPopup('<div class="center-popup"><strong>搜尋中心</strong></div>');
}

// 添加地點標記
function addPlaceMarkers() {
  if (!map) return;

  // 清除舊標記
  markers.forEach(marker => marker.remove());
  markers = [];

  // 添加新標記
  props.places.forEach(place => {
    const marker = L.marker([place.latitude, place.longitude], {
      icon: createIcon(place.type),
    });

    // Popup 內容
    const popupContent = createPopupContent(place);
    marker.bindPopup(popupContent, {
      maxWidth: 250,
      className: 'place-popup',
    });

    // 點擊事件
    marker.on('popupopen', () => {
      // 綁定按鈕事件
      setTimeout(() => {
        const detailBtn = document.getElementById(`detail-btn-${place.id}`);
        const navBtn = document.getElementById(`nav-btn-${place.id}`);

        if (detailBtn) {
          detailBtn.addEventListener('click', () => {
            emit('selectPlace', place);
          });
        }

        if (navBtn) {
          navBtn.addEventListener('click', () => {
            emit('navigate', place);
          });
        }
      }, 0);
    });

    marker.addTo(map!);
    markers.push(marker);
  });
}

// 建立 Popup 內容
function createPopupContent(place: PlaceSummary): string {
  const typeLabel = place.type === 'restaurant' ? '餐廳' : '景點';
  const typeClass = place.type === 'restaurant' ? 'type-restaurant' : 'type-attraction';
  const categoryName = place.categories[0]?.name || '';
  const ratingHtml = place.rating ? `<span class="popup-rating">★ ${(place.rating / 2).toFixed(1)}</span>` : '';

  return `
    <div class="popup-content">
      <div class="popup-header">
        <span class="popup-type ${typeClass}">${typeLabel}</span>
        <span class="popup-distance">${formatDistance(place.distance)}</span>
      </div>
      <h4 class="popup-name">${place.name}</h4>
      ${categoryName ? `<p class="popup-category">${categoryName}</p>` : ''}
      <div class="popup-meta">${ratingHtml}</div>
      <div class="popup-actions">
        <button id="detail-btn-${place.id}" class="popup-btn popup-btn-detail" type="button">查看詳情</button>
        <button id="nav-btn-${place.id}" class="popup-btn popup-btn-nav" type="button">🧭 導航</button>
      </div>
    </div>
  `;
}

// 調整地圖視野以包含所有標記
function fitBounds() {
  if (!map || props.places.length === 0) return;

  const bounds = L.latLngBounds([
    [props.center.latitude, props.center.longitude],
    ...props.places.map(p => [p.latitude, p.longitude] as [number, number]),
  ]);

  map.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 16,
  });
}

// 清理地圖
function destroyMap() {
  if (map) {
    map.remove();
    map = null;
  }
  markers = [];
  centerMarker = null;
}

// 監聽地點變化
watch(() => props.places, () => {
  if (map) {
    addPlaceMarkers();
    fitBounds();
  }
}, { deep: true });

// 監聽中心點變化
watch(() => props.center, () => {
  if (map) {
    addCenterMarker();
    map.setView([props.center.latitude, props.center.longitude]);
  }
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    initMap();
    if (props.places.length > 0) {
      fitBounds();
    }
  });
});

onUnmounted(() => {
  destroyMap();
});

// 公開方法
defineExpose({
  fitBounds,
});
</script>

<template>
  <div class="recommendation-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.recommendation-map {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
/* Leaflet 自定義樣式（全域） */
.custom-marker {
  background: transparent;
  border: none;
}

.marker-icon {
  width: 36px;
  height: 36px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.marker-icon span {
  transform: rotate(45deg);
  font-size: 16px;
}

/* Popup 樣式 */
.place-popup .leaflet-popup-content-wrapper {
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.place-popup .leaflet-popup-content {
  margin: 0;
  min-width: 200px;
}

.place-popup .leaflet-popup-tip {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.popup-content {
  padding: 12px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.popup-type {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.popup-type.type-restaurant {
  color: #E67E22;
  background: rgba(230, 126, 34, 0.1);
}

.popup-type.type-attraction {
  color: #3498DB;
  background: rgba(52, 152, 219, 0.1);
}

.popup-distance {
  font-size: 11px;
  color: #999;
}

.popup-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
  line-height: 1.3;
}

.popup-category {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px;
}

.popup-meta {
  margin-bottom: 12px;
}

.popup-rating {
  font-size: 12px;
  color: #F39C12;
}

.popup-actions {
  display: flex;
  gap: 8px;
}

.popup-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.popup-btn-detail {
  color: #3498DB;
  background: rgba(52, 152, 219, 0.1);
}

.popup-btn-detail:hover {
  background: rgba(52, 152, 219, 0.2);
}

.popup-btn-nav {
  color: #fff;
  background: #3498DB;
}

.popup-btn-nav:hover {
  background: #2980B9;
}

.center-popup {
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
}
</style>
