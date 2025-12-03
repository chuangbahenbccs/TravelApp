# 實作計畫：Google Places API 遷移

**分支**: `003-google-places-migration` | **日期**: 2025-12-03 | **規格**: [spec.md](./spec.md)
**輸入**: 功能規格來自 `/specs/003-google-places-migration/spec.md`

## 摘要

將附近餐廳與景點推薦功能的資料來源從 Foursquare Places API 遷移至 Google Places API (New)，以獲得更準確的類別判斷。Google Places API 的 `types` 陣列直接包含 `restaurant`、`cafe`、`tourist_attraction` 等類型，無需透過關鍵字比對判斷。

## 遷移原因

Foursquare Places API 的類別判斷不夠準確，餐廳經常被誤判為景點。即使使用關鍵字比對改進，仍有邊緣案例無法正確判斷。

## 技術背景

**語言/版本**: TypeScript ^5.0
**主要依賴**: Vue 3 + Composition API ^3.4, Dexie.js ^4.0
**儲存方案**: IndexedDB（透過 Dexie.js），沿用現有 `recommendationCaches` 資料表
**目標平台**: PWA - iPhone Safari 為主
**效能目標**: 推薦清單 < 3 秒載入

## 憲法檢核

### 初始檢核

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 行動優先 PWA | ✅ 通過 | 無 UI 變更，維持現有設計 |
| II. 資料層抽離 | ✅ 通過 | 沿用 IPlacesProvider 介面 |
| III. 日式極簡設計 | ✅ 通過 | 無 UI 變更 |
| IV. 離線優先 | ✅ 通過 | 沿用現有快取機制 |
| V. 元件單一職責 | ✅ 通過 | 僅新增 Provider 實作 |

### 技術約束檢核

| 項目 | 狀態 | 說明 |
|------|------|------|
| Vue 3 + Composition API | ✅ 符合 | 無變更 |
| TypeScript | ✅ 符合 | 所有新檔案使用 TypeScript |
| Dexie.js | ✅ 符合 | 沿用現有 Repository |
| 禁止硬編碼 API Key | ✅ 符合 | 使用 `VITE_GOOGLE_PLACES_API_KEY` |

## 變更範圍

### 程式碼變更

| 檔案 | 變更內容 |
|------|----------|
| `src/services/places/GooglePlacesProvider.ts` | **新增** - 實作 IPlacesProvider 介面 |
| `src/services/places/FoursquarePlacesProvider.ts` | **保留** - 作為備用（不刪除） |
| `src/services/places/index.ts` | **新增** - 導出並選擇使用哪個 Provider |
| `src/composables/useNearbyRecommendations.ts` | **修改** - 改用 Google Provider |
| `vite.config.ts` | **修改** - 新增 Google API 代理設定 |
| `.env.local` | **修改** - 新增 `VITE_GOOGLE_PLACES_API_KEY` |

### 環境變數

```bash
# .env.local
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## Google Places API 技術規格

### 端點

```
Base URL: https://places.googleapis.com/v1
認證方式: X-Goog-Api-Key header
```

| 端點 | 方法 | 用途 |
|------|------|------|
| `/places:searchNearby` | POST | 附近搜尋 |
| `/places/{placeId}` | GET | 地點詳情 |

### 請求範例 - 附近搜尋

```json
POST https://places.googleapis.com/v1/places:searchNearby
Headers:
  X-Goog-Api-Key: {API_KEY}
  X-Goog-FieldMask: places.id,places.displayName,places.location,places.types,places.formattedAddress,places.rating,places.priceLevel

Body:
{
  "locationRestriction": {
    "circle": {
      "center": { "latitude": 35.7147, "longitude": 139.7967 },
      "radius": 1000.0
    }
  },
  "includedTypes": ["restaurant", "cafe", "bar"]
}
```

### 類型對應

| 我們的類型 | Google Places types |
|-----------|---------------------|
| restaurant | restaurant, cafe, bar, bakery, meal_delivery, meal_takeaway |
| attraction | tourist_attraction, museum, park, amusement_park, zoo, aquarium |

## CORS 處理

### 開發環境（Vite 代理）

```typescript
// vite.config.ts
'/api/google-places': {
  target: 'https://places.googleapis.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/google-places/, ''),
}
```

### 生產環境

需要後端代理（Cloudflare Workers / Vercel Edge Functions）

## 實作步驟

### Step 1: 新增 Vite 代理設定
1. 修改 `vite.config.ts` 新增 `/api/google-places` 代理

### Step 2: 新增環境變數
1. 在 `.env.local` 新增 `VITE_GOOGLE_PLACES_API_KEY`

### Step 3: 建立 GooglePlacesProvider
1. 建立 `src/services/places/GooglePlacesProvider.ts`
2. 實作 `IPlacesProvider` 介面
3. 實作 `searchNearby`、`getPlaceDetails` 方法
4. 使用 `types` 陣列判斷地點類型

### Step 4: 建立 Provider 索引檔
1. 建立 `src/services/places/index.ts`
2. 導出 Google Provider（預設）和 Foursquare Provider（備用）

### Step 5: 更新 Composable
1. 修改 `useNearbyRecommendations.ts` 使用 Google Provider

### Step 6: 測試驗證
1. 測試附近搜尋功能
2. 確認餐廳/景點類別判斷正確
3. 測試離線快取功能
4. 確認所有現有功能正常

## 注意事項

1. **API Key 安全**：Google API Key 需在 Google Cloud Console 設定 HTTP Referrer 限制
2. **免費額度**：$200/月免費額度，超過後約 $2.83-$13.60/千次
3. **CORS**：生產環境需要後端代理
4. **保留 Foursquare**：FoursquarePlacesProvider 不刪除，作為備用方案

## 產出物清單

| 檔案 | 狀態 | 說明 |
|------|------|------|
| spec.md | ✅ 完成 | 功能規格 |
| plan.md | ✅ 完成 | 本檔案 |
| research.md | 待建立 | 技術研究文件 |
| tasks.md | 待產生 | 由 `/speckit.tasks` 產生 |

---

## 下一步

執行 `/speckit.tasks` 產生任務清單，然後進行人工審核後開始實作。
