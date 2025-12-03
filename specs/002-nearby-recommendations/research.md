# 技術研究：附近餐廳與景點推薦

**功能分支**: `002-nearby-recommendations`
**研究日期**: 2025-11-28

## 1. Foursquare Places API

### 決策：使用 Foursquare Places API v3 作為資料來源

**理由**：
- 免費額度充足：每月 $200 免費額度，約可呼叫 40,000 次 Place Search（Core attributes）
- 資料品質高：超過 1,000 種類別，涵蓋餐廳、景點等
- 支援日本地區：對東京、大阪等旅遊熱門地點有完整資料
- 架構可擴展：日後可切換至 Google Places API 而不影響業務邏輯

**替代方案評估**：
| 方案 | 優點 | 缺點 | 結論 |
|------|------|------|------|
| Google Places API | 資料最完整、與 Google Maps 整合 | 費用較高、需綁定信用卡 | 作為備選 |
| Yelp Fusion API | 評論資料豐富 | 日本地區資料較少 | 不採用 |
| OpenStreetMap Nominatim | 完全免費 | 無評分、營業時間等資料 | 不採用 |

### API 端點

#### Place Search（主要端點）
```
GET https://api.foursquare.com/v3/places/search
```

**必要參數**：
- `ll`: 經緯度，格式 `latitude,longitude`（如 `35.7147,139.7772`）
- `radius`: 搜尋半徑（公尺），預設 1000
- `categories`: 類別 ID（逗號分隔）

**驗證方式**：
```
Header: Authorization: {API_KEY}
```

**類別 ID（確認）**：
- `13000`: Dining and Drinking（餐廳、咖啡廳、酒吧）
- `16000`: Landmarks and Outdoors（景點、公園、地標）

### 回應欄位

#### Core Fields（免費）
| 欄位 | 類型 | 說明 |
|------|------|------|
| `fsq_id` | String | 唯一識別碼 |
| `name` | String | 地點名稱 |
| `geocodes.main` | Object | 座標 `{latitude, longitude}` |
| `location` | Object | 地址資訊 `{formatted_address, locality, region}` |
| `categories` | Array | 類別 `[{id, name, icon}]` |
| `distance` | Number | 距離（公尺） |
| `closed_bucket` | String | 營業狀態推測 |

#### Rich Fields（需額外計費）
| 欄位 | 類型 | 說明 |
|------|------|------|
| `rating` | Float | 評分 0.0-10.0 |
| `price` | Integer | 價格等級 1-4 |
| `hours` | Array | 營業時間 |
| `photos` | Array | 照片列表 |
| `description` | String | 簡介 |

### 費率限制

| 方案 | QPS 限制 | 月費 |
|------|----------|------|
| Sandbox/Pay-as-you-go | 50 QPS | $200 免費額度 |
| Enterprise | 100 QPS | 洽詢 |

**成本估算**（Core attributes）：
- 每 1,000 次呼叫約 $0.005
- $200 額度 ≈ 40,000 次呼叫/月
- 對於個人旅遊 App 綽綽有餘

### 實作注意事項

1. **API Key 管理**：使用環境變數 `VITE_FOURSQUARE_API_KEY`
2. **快取策略**：搜尋結果快取 7 天，減少 API 呼叫
3. **錯誤處理**：429 Too Many Requests 需實作 retry with backoff
4. **評分轉換**：Foursquare 使用 0-10 分，需轉換為 5 星制顯示

---

## 2. 地圖整合方案

### 決策：使用 @vue-leaflet/vue-leaflet + OpenStreetMap

**理由**：
- 完全免費：OpenStreetMap 圖層無需 API Key
- Vue 3 原生支援：@vue-leaflet/vue-leaflet 完整支援 Composition API + TypeScript
- 輕量化：比 Google Maps SDK 小，適合 PWA
- 離線友善：可搭配 Service Worker 快取地圖 tiles

**替代方案評估**：
| 方案 | 優點 | 缺點 | 結論 |
|------|------|------|------|
| Google Maps SDK | 功能最完整、街景支援 | 需 API Key、費用 | 不採用（PWA 離線考量） |
| Mapbox GL JS | 美觀、高效能 | 需 API Key、免費額度有限 | 作為備選 |
| 靜態地圖圖片 | 最簡單、離線友善 | 無互動性 | 不採用 |

### 套件安裝

```bash
npm install leaflet @vue-leaflet/vue-leaflet
npm install -D @types/leaflet
```

### 基本用法

```vue
<template>
  <l-map
    :zoom="15"
    :center="[35.7147, 139.7772]"
    :useGlobalLeaflet="false"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />
    <l-marker
      v-for="place in places"
      :key="place.id"
      :lat-lng="[place.lat, place.lng]"
      @click="onMarkerClick(place)"
    >
      <l-popup>{{ place.name }}</l-popup>
    </l-marker>
  </l-map>
</template>
```

### 行動優化

1. **觸控支援**：Leaflet 原生支援觸控手勢（縮放、平移）
2. **響應式尺寸**：使用 CSS `height: 100%` 或固定高度
3. **效能優化**：
   - 使用 `preferCanvas: true` 大量 marker 時改用 Canvas 渲染
   - 限制同時顯示的 marker 數量（建議 < 100）

### 離線支援考量

- OpenStreetMap tiles 可透過 Service Worker 快取
- 但完整離線地圖需大量儲存空間，不建議
- 建議：離線時顯示「地圖需要網路連線」提示，但清單仍可使用

---

## 3. 地點名稱轉座標（Geocoding）

### 決策：使用 Foursquare Autocomplete API

**理由**：
- 統一資料來源：與 Place Search 使用相同 API，資料一致性高
- 包含在免費額度內
- 回傳 Foursquare 的 place ID，可直接用於後續查詢

**端點**：
```
GET https://api.foursquare.com/v3/autocomplete
```

**參數**：
- `query`: 地點名稱（如「上野公園」）
- `ll`: 優先搜尋的中心點（可選）
- `types`: 限制結果類型（`place`, `address`, `geo`）

**替代方案**：
- OpenStreetMap Nominatim：免費但無評分資料
- Google Geocoding API：需額外費用

---

## 4. Repository 抽象層設計

### 決策：建立 PlacesProvider 介面

為符合憲法「資料層抽離」原則，設計抽象介面：

```typescript
// src/services/places/IPlacesProvider.ts
interface IPlacesProvider {
  searchNearby(params: SearchParams): Promise<Place[]>;
  getPlaceDetails(id: string): Promise<PlaceDetails>;
  geocode(query: string): Promise<GeoLocation | null>;
}

// src/services/places/FoursquarePlacesProvider.ts
class FoursquarePlacesProvider implements IPlacesProvider {
  // Foursquare API 實作
}

// 未來可新增
// class GooglePlacesProvider implements IPlacesProvider { ... }
```

### 快取層設計

```typescript
// src/repositories/interfaces/IRecommendationCacheRepository.ts
interface IRecommendationCacheRepository {
  get(centerKey: string): Promise<CachedRecommendation | null>;
  set(centerKey: string, data: CachedRecommendation): Promise<void>;
  clear(): Promise<void>;
}
```

---

## 5. 總結

| 技術選擇 | 決策 | 理由 |
|----------|------|------|
| 地點資料 | Foursquare Places API v3 | 免費額度充足、資料品質高 |
| 地圖元件 | @vue-leaflet/vue-leaflet | Vue 3 原生、免費、輕量 |
| 地圖圖層 | OpenStreetMap | 完全免費、無需 API Key |
| Geocoding | Foursquare Autocomplete | 統一資料來源 |
| 架構模式 | Provider 抽象介面 | 符合憲法、便於擴展 |

---

## 參考來源

- [Foursquare Places API Overview](https://docs.foursquare.com/developer/reference/places-api-overview)
- [Foursquare Response Fields](https://docs.foursquare.com/developer/reference/response-fields)
- [Foursquare Rate Limits](https://docs.foursquare.com/developer/reference/rate-limits)
- [Foursquare Categories](https://docs.foursquare.com/data-products/docs/categories)
- [Vue Leaflet GitHub](https://github.com/vue-leaflet/vue-leaflet)
- [@vue-leaflet/vue-leaflet NPM](https://www.npmjs.com/package/@vue-leaflet/vue-leaflet)
