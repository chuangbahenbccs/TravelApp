# 快速入門：附近餐廳與景點推薦

**功能分支**: `002-nearby-recommendations`

## 環境設定

### 1. 安裝依賴

```bash
# 地圖元件
npm install leaflet @vue-leaflet/vue-leaflet

# TypeScript 型別定義
npm install -D @types/leaflet
```

### 2. 環境變數

在專案根目錄建立或編輯 `.env.local`：

```env
# Foursquare Places API
VITE_FOURSQUARE_API_KEY=your_api_key_here
```

**取得 API Key**：
1. 前往 [Foursquare Developer Console](https://foursquare.com/developers/signup)
2. 建立帳號並建立新專案
3. 在專案設定中取得 API Key

### 3. 資料庫升級

執行 IndexedDB schema 升級：

```typescript
// src/database/db.ts
// 新增 recommendationCaches 資料表
this.version(2).stores({
  trips: '++id, name',
  dayPlans: '++id, tripId, date',
  recommendationCaches: '++id, centerKey, cachedAt, expiresAt'  // 新增
});
```

---

## 核心檔案結構

```
src/
├── services/
│   └── places/
│       ├── IPlacesProvider.ts          # Provider 介面
│       └── FoursquarePlacesProvider.ts # Foursquare 實作
│
├── repositories/
│   ├── interfaces/
│   │   └── IRecommendationCacheRepository.ts
│   └── implementations/
│       └── DexieRecommendationCacheRepository.ts
│
├── composables/
│   └── useNearbyRecommendations.ts     # 主要 composable
│
├── components/
│   └── recommendations/
│       ├── NearbyButton.vue            # 附近推薦按鈕
│       ├── RecommendationList.vue      # 推薦清單
│       ├── RecommendationCard.vue      # 推薦卡片
│       ├── RecommendationMap.vue       # 嵌入式地圖
│       ├── PlaceDetailModal.vue        # 詳情 Modal
│       └── CategoryFilter.vue          # 類別篩選
│
├── views/
│   └── NearbyView.vue                  # 附近推薦頁面
│
└── types/
    └── recommendation.ts               # 型別定義
```

---

## 快速開始程式碼範例

### 1. Foursquare Provider 基本用法

```typescript
// src/services/places/FoursquarePlacesProvider.ts
import type { IPlacesProvider, NearbySearchParams, NearbySearchResult } from './IPlacesProvider';

export class FoursquarePlacesProvider implements IPlacesProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.foursquare.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchNearby(params: NearbySearchParams): Promise<NearbySearchResult> {
    const url = new URL(`${this.baseUrl}/places/search`);
    url.searchParams.set('ll', `${params.center.latitude},${params.center.longitude}`);
    url.searchParams.set('radius', String(params.radius ?? 1000));
    url.searchParams.set('limit', String(params.limit ?? 20));

    // 類別篩選
    if (params.types?.length) {
      const categoryIds = params.types.map(t =>
        t === 'restaurant' ? '13000' : '16000'
      );
      url.searchParams.set('categories', categoryIds.join(','));
    } else {
      url.searchParams.set('categories', '13000,16000');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformResponse(data, params.center);
  }

  // ... 其他方法
}
```

### 2. Composable 用法

```typescript
// src/composables/useNearbyRecommendations.ts
import { ref, computed } from 'vue';
import type { PlaceSummary, PlaceType } from '@/types/recommendation';

export function useNearbyRecommendations() {
  const places = ref<PlaceSummary[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const activeFilter = ref<PlaceType | 'all'>('all');

  const filteredPlaces = computed(() => {
    if (activeFilter.value === 'all') return places.value;
    return places.value.filter(p => p.type === activeFilter.value);
  });

  async function searchNearby(lat: number, lng: number) {
    isLoading.value = true;
    error.value = null;

    try {
      // 先檢查快取
      const cached = await cacheRepo.get(generateCacheKey({ latitude: lat, longitude: lng }, 1000));
      if (cached) {
        places.value = cached.places;
        return;
      }

      // 呼叫 API
      const result = await provider.searchNearby({
        center: { latitude: lat, longitude: lng },
        radius: 1000,
      });

      places.value = result.places;

      // 儲存快取
      await cacheRepo.set(createCachedRecommendation(
        { name: '', latitude: lat, longitude: lng, radius: 1000, searchedAt: new Date() },
        result.places
      ));
    } catch (e) {
      error.value = e instanceof Error ? e.message : '載入失敗';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    places,
    filteredPlaces,
    isLoading,
    error,
    activeFilter,
    searchNearby,
  };
}
```

### 3. 地圖元件用法

```vue
<!-- src/components/recommendations/RecommendationMap.vue -->
<template>
  <div class="map-container">
    <l-map
      ref="mapRef"
      :zoom="15"
      :center="center"
      :useGlobalLeaflet="false"
      style="height: 300px; width: 100%;"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <!-- 中心點標記 -->
      <l-marker :lat-lng="center">
        <l-icon :icon-url="centerIcon" :icon-size="[32, 32]" />
      </l-marker>

      <!-- 推薦地點標記 -->
      <l-marker
        v-for="place in places"
        :key="place.id"
        :lat-lng="[place.latitude, place.longitude]"
        @click="$emit('select', place)"
      >
        <l-popup>
          <div class="popup-content">
            <strong>{{ place.name }}</strong>
            <p>{{ formatDistance(place.distance) }}</p>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import type { PlaceSummary } from '@/types/recommendation';
import { formatDistance } from '@/utils/formatters';

defineProps<{
  center: [number, number];
  places: PlaceSummary[];
}>();

defineEmits<{
  select: [place: PlaceSummary];
}>();
</script>
```

---

## 測試 API

### 測試 Foursquare API 連線

```bash
# 使用 curl 測試（替換 YOUR_API_KEY）
curl -X GET "https://api.foursquare.com/v3/places/search?ll=35.7147,139.7772&radius=1000&categories=13000,16000&limit=5" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Accept: application/json"
```

### 預期回應格式

```json
{
  "results": [
    {
      "fsq_id": "4b5af9a7f964a520c12628e3",
      "name": "上野恩賜公園",
      "geocodes": {
        "main": {
          "latitude": 35.714765,
          "longitude": 139.773516
        }
      },
      "location": {
        "formatted_address": "東京都台東區上野公園"
      },
      "categories": [
        {
          "id": 16032,
          "name": "Park",
          "icon": { ... }
        }
      ],
      "distance": 50
    }
  ]
}
```

---

## 常見問題

### Q: 地圖載入空白？

確認已正確引入 Leaflet CSS：

```typescript
// main.ts 或元件中
import 'leaflet/dist/leaflet.css';
```

### Q: API 回傳 401 Unauthorized？

檢查：
1. `.env.local` 中的 `VITE_FOURSQUARE_API_KEY` 是否正確
2. API Key 是否已在 Foursquare Console 啟用

### Q: 如何處理離線？

```typescript
// 在 searchNearby 中
if (!navigator.onLine) {
  const cached = await cacheRepo.getIncludingExpired(cacheKey);
  if (cached) {
    places.value = cached.places;
    isFromCache.value = true;
    return;
  }
  throw new Error('需要網路連線');
}
```

---

## 下一步

1. 執行 `/speckit.tasks` 產生任務清單
2. 按照任務清單順序實作
3. 先完成 P1 功能（附近推薦按鈕、清單、篩選）
4. 再實作 P2 功能（地圖、詳情、導航）
5. 最後實作 P3 功能（離線快取）
