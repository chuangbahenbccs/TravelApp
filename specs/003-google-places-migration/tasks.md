# 任務清單：Google Places API 遷移

**輸入**: 設計文件來自 `/specs/003-google-places-migration/`
**前置條件**: plan.md、spec.md、research.md

**組織方式**: 任務依使用者故事分組，以便各故事可獨立實作與測試。

## 格式：`[編號] [P?] [故事] 描述`

- **[P]**: 可平行執行（不同檔案、無相依性）
- **[故事]**: 此任務所屬的使用者故事（例如 US1, US2）
- 描述中包含確切的檔案路徑

---

## 第 1 階段：環境設定

**目的**: 配置開發環境和 API 代理

- [ ] T001 在 vite.config.ts 新增 `/api/google-places` 代理設定
- [ ] T002 [P] 在 .env.local 新增 VITE_GOOGLE_PLACES_API_KEY 環境變數
- [ ] T003 [P] 在 src/types/env.d.ts 新增環境變數型別定義（若不存在則建立）

---

## 第 2 階段：基礎建設（阻塞性前置條件）

**目的**: 建立 Google Places Provider 核心實作

**⚠️ 關鍵**: 此階段完成前，不得開始任何使用者故事

- [ ] T004 在 src/services/places/GooglePlacesProvider.ts 建立 GooglePlacesProvider 類別骨架
- [ ] T005 在 src/services/places/GooglePlacesProvider.ts 實作 API 請求基礎設施（fetch wrapper、headers、錯誤處理）
- [ ] T006 在 src/services/places/GooglePlacesProvider.ts 定義 Google API 回應型別介面
- [ ] T007 在 src/services/places/index.ts 建立 Provider 索引檔，導出 createGooglePlacesProvider 工廠函式

**檢查點**: 基礎建設就緒 - 可開始實作使用者故事

---

## 第 3 階段：使用者故事 1+2 - 準確的類型分類 (優先級: P1) 🎯 MVP

**目標**: 實作 Google Places API 的類型判斷邏輯，確保餐廳和景點被正確分類

**獨立測試方式**: 搜尋上野公園附近，確認拉麵店顯示為「餐廳」、博物館顯示為「景點」

### 實作

- [ ] T008 [US1] 在 src/services/places/GooglePlacesProvider.ts 定義 RESTAURANT_TYPES 和 ATTRACTION_TYPES 常數陣列
- [ ] T009 [US1] 在 src/services/places/GooglePlacesProvider.ts 實作 determineType() 方法，使用 types 陣列判斷地點類型
- [ ] T010 [US1] 在 src/services/places/GooglePlacesProvider.ts 實作 searchNearby() 方法
- [ ] T011 [P] [US1] 在 src/services/places/GooglePlacesProvider.ts 實作 transformToPlaceSummary() 轉換方法
- [ ] T012 [US2] 在 src/services/places/GooglePlacesProvider.ts 實作 includedTypes 參數邏輯（餐廳/景點篩選）

**檢查點**: 此時應能正確判斷餐廳和景點類型

---

## 第 4 階段：使用者故事 3 - 維持現有功能 (優先級: P1)

**目標**: 完整實作 IPlacesProvider 介面，確保所有現有功能正常運作

**獨立測試方式**: 點擊「附近推薦」按鈕，確認清單顯示、篩選、詳情查看都正常

### 實作

- [ ] T013 [US3] 在 src/services/places/GooglePlacesProvider.ts 實作 getPlaceDetails() 方法
- [ ] T014 [P] [US3] 在 src/services/places/GooglePlacesProvider.ts 實作 transformToPlaceDetails() 轉換方法
- [ ] T015 [US3] 在 src/services/places/GooglePlacesProvider.ts 實作 geocode() 方法（使用 searchText 端點）
- [ ] T016 [US3] 在 src/services/places/GooglePlacesProvider.ts 實作價格等級轉換（PRICE_LEVEL_* → 數字）
- [ ] T017 [US3] 在 src/services/places/GooglePlacesProvider.ts 實作照片 URL 建構邏輯
- [ ] T018 [US3] 在 src/composables/useNearbyRecommendations.ts 將 Provider 從 Foursquare 切換為 Google

**檢查點**: 此時所有推薦功能應完整運作

---

## 第 5 階段：使用者故事 4 - 離線快取支援 (優先級: P2)

**目標**: 確認 Google Places API 資料與現有快取機制相容

**獨立測試方式**: 搜尋一個地點後，開啟飛航模式再次查看，確認顯示快取結果

### 實作

- [ ] T019 [US4] 驗證 PlaceSummary/PlaceDetails 資料結構與現有快取 Repository 相容
- [ ] T020 [US4] 在 src/composables/useNearbyRecommendations.ts 確認快取鍵生成邏輯適用於 Google API 資料

**檢查點**: 離線快取功能正常運作

---

## 第 6 階段：收尾與跨領域關注點

**目的**: 錯誤處理、清理和文件

- [ ] T021 在 src/services/places/GooglePlacesProvider.ts 實作 429 速率限制錯誤處理
- [ ] T022 [P] 在 src/services/places/GooglePlacesProvider.ts 實作 API Key 未設定錯誤處理
- [ ] T023 [P] 更新 specs/003-google-places-migration/plan.md 標記所有產出物為完成
- [ ] T024 手動測試驗證：搜尋上野公園附近，確認類型分類正確
- [ ] T025 手動測試驗證：確認離線快取功能正常

---

## 相依性與執行順序

### 階段相依性

- **環境設定（第 1 階段）**: 無相依性 - 可立即開始
- **基礎建設（第 2 階段）**: 依賴環境設定完成
- **使用者故事（第 3-5 階段）**: 依賴基礎建設完成
- **收尾（第 6 階段）**: 依賴所有使用者故事完成

### 使用者故事相依性

- **使用者故事 1+2 (P1)**: 基礎建設完成後可開始 - 類型判斷為核心功能
- **使用者故事 3 (P1)**: 依賴 US1+2 完成 - 需要 searchNearby 和類型判斷
- **使用者故事 4 (P2)**: 依賴 US3 完成 - 需要完整的 Provider 實作

### 平行化機會

- T002, T003 可與 T001 平行執行
- T011 可與 T010 平行執行（不同方法）
- T014 可與 T013 平行執行
- T022, T023 可與 T021 平行執行

---

## 平行化範例：基礎建設階段

```bash
# 同時啟動環境設定：
任務: "在 vite.config.ts 新增代理設定"
任務: "在 .env.local 新增環境變數"
任務: "在 src/types/env.d.ts 新增型別定義"
```

---

## 實作策略

### MVP 優先（使用者故事 1+2）

1. 完成第 1 階段：環境設定
2. 完成第 2 階段：基礎建設
3. 完成第 3 階段：使用者故事 1+2（類型判斷）
4. **停止並驗證**: 測試餐廳/景點分類是否正確
5. 若正確，繼續實作完整功能

### 增量交付

1. 環境設定 + 基礎建設 → Provider 骨架就緒
2. 新增 US1+2 → 類型判斷正確 → **核心價值達成**
3. 新增 US3 → 完整功能 → 可取代 Foursquare
4. 新增 US4 → 離線支援 → 完整遷移

---

## 備註

- [P] 任務 = 不同檔案或不同方法、無相依性
- [故事] 標籤將任務對應到特定使用者故事
- 本遷移不刪除 FoursquarePlacesProvider，保留作為備用
- 遷移後主要在 composable 層切換 Provider，無需修改 UI 元件
