# 資料模型：附近餐廳與景點推薦

**功能分支**: `002-nearby-recommendations`
**建立日期**: 2025-11-28

## 實體關係圖

```
┌─────────────────┐       ┌─────────────────────┐
│   SearchCenter  │ 1───* │  RecommendedPlace   │
│─────────────────│       │─────────────────────│
│ name            │       │ id                  │
│ latitude        │       │ name                │
│ longitude       │       │ type                │
│ radius          │       │ latitude            │
│ searchedAt      │       │ longitude           │
└─────────────────┘       │ distance            │
        │                 │ rating              │
        │                 │ priceLevel          │
        │ 1               │ address             │
        │                 │ categories          │
        ▼                 │ photos              │
┌─────────────────────┐   │ hours               │
│ RecommendationCache │   │ description         │
│─────────────────────│   │ closedBucket        │
│ id                  │   └─────────────────────┘
│ centerKey           │
│ places              │
│ cachedAt            │
│ expiresAt           │
└─────────────────────┘
```

---

## 實體定義

### 1. RecommendedPlace

代表一個推薦的地點（餐廳或景點）。

```typescript
// src/types/recommendation.ts

/** 地點類型 */
type PlaceType = 'restaurant' | 'attraction';

/** 價格等級 (1-4) */
type PriceLevel = 1 | 2 | 3 | 4;

/** 營業狀態推測 */
type ClosedBucket =
  | 'VeryLikelyOpen'
  | 'LikelyOpen'
  | 'Unsure'
  | 'LikelyClosed'
  | 'VeryLikelyClosed';

/** 類別資訊 */
interface PlaceCategory {
  id: string;
  name: string;
  iconUrl?: string;
}

/** 照片資訊 */
interface PlacePhoto {
  id: string;
  url: string;
  width: number;
  height: number;
}

/** 營業時間 */
interface OpeningHours {
  display: string;        // 格式化顯示字串
  isOpenNow?: boolean;
  periods?: {
    day: number;          // 0=Sunday, 6=Saturday
    open: string;         // "HH:MM"
    close: string;        // "HH:MM"
  }[];
}

/** 推薦地點 */
interface RecommendedPlace {
  // 核心欄位
  id: string;                    // Foursquare fsq_id
  name: string;                  // 地點名稱
  type: PlaceType;               // 類型：餐廳/景點

  // 地理資訊
  latitude: number;              // 緯度
  longitude: number;             // 經度
  distance: number;              // 距離搜尋中心點（公尺）

  // 地址資訊
  address: string;               // 格式化地址
  locality?: string;             // 城市/區域

  // 評價資訊
  rating?: number;               // 評分 (0-10，顯示時轉換為 5 星)
  priceLevel?: PriceLevel;       // 價格等級

  // 類別
  categories: PlaceCategory[];   // 類別列表

  // 詳細資訊（可選）
  description?: string;          // 簡介
  photos?: PlacePhoto[];         // 照片列表
  hours?: OpeningHours;          // 營業時間
  closedBucket?: ClosedBucket;   // 營業狀態推測

  // 導航
  navigationUrl?: string;        // Google Maps 導航 URL
}
```

**驗證規則**：
- `id`: 必填，非空字串
- `name`: 必填，非空字串
- `type`: 必填，只能是 `restaurant` 或 `attraction`
- `latitude`: 必填，範圍 -90 到 90
- `longitude`: 必填，範圍 -180 到 180
- `distance`: 必填，非負數
- `address`: 必填，非空字串
- `rating`: 選填，範圍 0 到 10
- `priceLevel`: 選填，範圍 1 到 4

---

### 2. SearchCenter

代表搜尋的中心點。

```typescript
// src/types/recommendation.ts

/** 搜尋中心點 */
interface SearchCenter {
  name: string;           // 地點名稱（如「上野公園」）
  latitude: number;       // 緯度
  longitude: number;      // 經度
  radius: number;         // 搜尋半徑（公尺），預設 1000
  searchedAt: Date;       // 搜尋時間
}
```

**驗證規則**：
- `name`: 必填，非空字串
- `latitude`: 必填，範圍 -90 到 90
- `longitude`: 必填，範圍 -180 到 180
- `radius`: 必填，正整數，預設 1000

---

### 3. RecommendationCache

代表快取的搜尋結果，用於離線瀏覽。

```typescript
// src/types/recommendation.ts

/** 快取的推薦結果 */
interface RecommendationCache {
  id?: number;                     // IndexedDB auto-increment ID
  centerKey: string;               // 快取鍵值（格式：lat_lng_radius）
  center: SearchCenter;            // 搜尋中心點
  places: RecommendedPlace[];      // 推薦地點列表
  cachedAt: Date;                  // 快取時間
  expiresAt: Date;                 // 過期時間（預設 7 天後）
}
```

**快取鍵值格式**：
```typescript
// 產生快取鍵值
function generateCacheKey(lat: number, lng: number, radius: number): string {
  // 四捨五入到小數點後 4 位，避免浮點數精度問題
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  return `${roundedLat}_${roundedLng}_${radius}`;
}
```

**過期邏輯**：
- 預設 7 天過期
- 過期後自動重新查詢（若有網路）
- 無網路時仍可顯示過期資料，但標示「資料可能已過時」

---

## IndexedDB Schema

### 資料表定義

```typescript
// src/database/db.ts

import Dexie, { Table } from 'dexie';

class TravelAppDatabase extends Dexie {
  // 現有資料表
  trips!: Table<Trip>;
  dayPlans!: Table<DayPlan>;

  // 新增：推薦快取
  recommendationCaches!: Table<RecommendationCache>;

  constructor() {
    super('TravelAppDB');

    // 版本升級
    this.version(2).stores({
      trips: '++id, name',
      dayPlans: '++id, tripId, date',
      recommendationCaches: '++id, centerKey, cachedAt, expiresAt'
    });
  }
}
```

**索引說明**：
- `centerKey`: 用於快速查找特定位置的快取
- `cachedAt`: 用於按時間排序
- `expiresAt`: 用於清理過期資料

---

## 狀態轉換

### 推薦載入狀態

```typescript
// src/types/recommendation.ts

type RecommendationStatus =
  | 'idle'          // 初始狀態
  | 'loading'       // 載入中
  | 'success'       // 載入成功
  | 'error'         // 載入失敗
  | 'offline';      // 離線（顯示快取）

interface RecommendationState {
  status: RecommendationStatus;
  center: SearchCenter | null;
  places: RecommendedPlace[];
  filteredPlaces: RecommendedPlace[];  // 篩選後的結果
  activeFilter: PlaceType | 'all';
  error: string | null;
  isFromCache: boolean;
  cacheAge?: Date;  // 快取時間（用於顯示「最後更新」）
}
```

### 狀態流程圖

```
                    ┌─────────┐
                    │  idle   │
                    └────┬────┘
                         │ 點擊「附近推薦」
                         ▼
                    ┌─────────┐
                    │ loading │
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ success │    │  error  │    │ offline │
    └─────────┘    └────┬────┘    └─────────┘
                        │ 重試
                        ▼
                   ┌─────────┐
                   │ loading │
                   └─────────┘
```

---

## 與現有模型的關聯

### Card 擴展

現有的 `Card` 類型（`ActivityCard`, `RestaurantCard`）需要新增 `location` 欄位來支援「附近推薦」功能：

```typescript
// src/types/card.ts（擴展）

interface LocationInfo {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// 現有卡片類型應已包含 location 資訊
// 若不存在，需要擴展：
interface BaseCard {
  // ... 現有欄位
  location?: LocationInfo;  // 用於附近推薦功能
}
```

**注意**：需要檢查現有 `Card` 類型是否已包含足夠的位置資訊。若行程卡片只有地點名稱沒有座標，則需要使用 Geocoding 轉換。

---

## 型別匯出

```typescript
// src/types/recommendation.ts

export type {
  PlaceType,
  PriceLevel,
  ClosedBucket,
  PlaceCategory,
  PlacePhoto,
  OpeningHours,
  RecommendedPlace,
  SearchCenter,
  RecommendationCache,
  RecommendationStatus,
  RecommendationState,
};
```

```typescript
// src/types/index.ts（更新）

export * from './trip';
export * from './day';
export * from './card';
export * from './recommendation';  // 新增
```
