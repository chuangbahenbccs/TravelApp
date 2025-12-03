# 任務清單：附近餐廳與景點推薦

**輸入**: 設計文件來自 `/specs/002-nearby-recommendations/`
**前置條件**: plan.md（必要）、spec.md（使用者故事必要）、research.md、data-model.md、contracts/

**測試**: 本功能規格未明確要求測試，故測試任務為選填。

**組織方式**: 任務依使用者故事分組，以便各故事可獨立實作與測試。

## 格式：`[編號] [P?] [故事] 描述`

- **[P]**: 可平行執行（不同檔案、無相依性）
- **[故事]**: 此任務所屬的使用者故事（例如 US1, US2, US3）
- 描述中包含確切的檔案路徑

---

## 第 1 階段：環境設定（共用基礎設施）

**目的**: 安裝依賴、建立專案結構

- [x] T001 安裝地圖相關依賴：`npm install leaflet @vue-leaflet/vue-leaflet && npm install -D @types/leaflet`
- [x] T002 [P] 建立推薦功能元件目錄 `src/components/recommendations/`
- [x] T003 [P] 建立服務層目錄 `src/services/places/`

---

## 第 2 階段：基礎建設（阻塞性前置條件）

**目的**: 任何使用者故事開始前必須完成的核心基礎設施

**⚠️ 關鍵**: 此階段完成前，不得開始任何使用者故事

### 型別定義

- [x] T004 [P] 建立推薦功能型別定義 `src/types/recommendation.ts`（包含 PlaceType, RecommendedPlace, SearchCenter, RecommendationCache, RecommendationState）
- [x] T005 更新型別匯出 `src/types/index.ts`，加入 `export * from './recommendation'`

### 資料庫升級

- [x] T006 升級 IndexedDB schema `src/database/db.ts`，新增 `recommendationCaches` 資料表（版本升級為 v2）

### Provider 介面與實作

- [x] T007 [P] 建立 Places Provider 介面 `src/services/places/IPlacesProvider.ts`（定義 searchNearby, getPlaceDetails, geocode 方法）
- [x] T008 實作 Foursquare Provider `src/services/places/FoursquarePlacesProvider.ts`（實作 IPlacesProvider 介面，呼叫 Foursquare API）

### Repository 介面與實作

- [x] T009 [P] 建立快取 Repository 介面 `src/repositories/interfaces/IRecommendationCacheRepository.ts`
- [x] T010 實作 Dexie 快取 Repository `src/repositories/implementations/DexieRecommendationCacheRepository.ts`

### 路由設定

- [x] T011 更新路由設定 `src/router/index.ts`，新增 `/nearby/:lat/:lng` 和 `/nearby/:lat/:lng/:placeId` 路由

### 主要 Composable

- [x] T012 建立推薦功能 Composable `src/composables/useNearbyRecommendations.ts`（整合 Provider 和 Cache Repository）

**檢查點**: 基礎建設就緒 - 可開始平行實作使用者故事

---

## 第 3 階段：使用者故事 1+2+3 - 核心推薦功能 (優先級: P1) 🎯 MVP

**目標**: 使用者可從行程卡片點擊「附近推薦」按鈕，查看推薦清單並篩選類別

**獨立測試方式**: 點擊任意行程卡片的「附近推薦」按鈕，確認顯示推薦清單，並可切換篩選

### 元件實作

- [x] T013 [P] [US1] 建立附近推薦按鈕元件 `src/components/recommendations/NearbyButton.vue`（接收 location 資訊，觸發推薦搜尋）
- [x] T014 [P] [US2] 建立推薦卡片元件 `src/components/recommendations/RecommendationCard.vue`（顯示名稱、類型、距離、評分、縮圖）
- [x] T015 [P] [US3] 建立類別篩選元件 `src/components/recommendations/CategoryFilter.vue`（全部/餐廳/景點切換）
- [x] T016 [US2] 建立推薦清單元件 `src/components/recommendations/RecommendationList.vue`（整合 RecommendationCard，支援載入更多）

### 頁面與整合

- [x] T017 [US1] 建立附近推薦頁面 `src/views/NearbyView.vue`（整合 CategoryFilter + RecommendationList）
- [x] T018 [US1] 修改現有卡片元件（ActivityCard.vue, RestaurantCard.vue）新增「附近推薦」按鈕

### 樣式

- [x] T019 [P] [US2] 樣式已整合在各元件中（遵循日式極簡設計原則）

**檢查點**: 此時使用者故事 1、2、3 應可完整運作

---

## 第 4 階段：使用者故事 4 - 地圖檢視 (優先級: P2)

**目標**: 使用者可在嵌入式地圖上查看所有推薦地點的位置標記

**獨立測試方式**: 切換到地圖檢視，確認地圖顯示正確，點擊標記可看到簡要資訊

### 元件實作

- [x] T020 [US4] 建立地圖元件 `src/components/recommendations/RecommendationMap.vue`（使用 Leaflet，顯示 OpenStreetMap 圖層）
- [x] T021 [US4] 在地圖元件中實作標記點擊事件，顯示 Popup 簡要資訊
- [x] T022 [US4] 更新 NearbyView.vue，新增清單/地圖檢視切換功能

**檢查點**: 此時使用者故事 4 應可獨立運作

---

## 第 5 階段：使用者故事 5+6 - 詳情與導航 (優先級: P2)

**目標**: 使用者可查看推薦詳情並導航至該地點

**獨立測試方式**: 點擊推薦項目，確認顯示詳情 Modal，點擊導航按鈕可開啟 Google Maps

### 元件實作

- [x] T023 [US5] 建立詳情 Modal 元件 `src/components/recommendations/PlaceDetailModal.vue`（顯示完整資訊：名稱、評分、價格、營業時間、地址、照片）
- [x] T024 [US6] 在 PlaceDetailModal 中實作導航按鈕，點擊後開啟 Google Maps（URL Scheme）
- [x] T025 [US6] 在 RecommendationCard 中新增導航圖示按鈕

### 整合

- [x] T026 [US5] 更新 NearbyView.vue，整合 PlaceDetailModal（點擊清單項目或地圖標記時開啟）
- [x] T027 [US5] 更新路由處理，支援 `/nearby/:lat/:lng/:placeId` 直接開啟詳情

**檢查點**: 此時使用者故事 5、6 應可獨立運作

---

## 第 6 階段：使用者故事 7 - 離線支援 (優先級: P3)

**目標**: 使用者可在離線狀態下查看之前搜尋過的推薦結果

**獨立測試方式**: 在離線模式下查看已快取的推薦，確認可正常顯示

### 快取邏輯

- [x] T028 [US7] 在 useNearbyRecommendations.ts 中實作快取讀取邏輯（搜尋前先檢查快取）
- [x] T029 [US7] 在 useNearbyRecommendations.ts 中實作快取寫入邏輯（搜尋成功後儲存）
- [x] T030 [US7] 實作離線狀態偵測，無網路時優先使用快取

### UI 提示

- [x] T031 [US7] 在 NearbyView.vue 新增「來自快取」提示（顯示快取時間）
- [x] T032 [US7] 新增「需要網路連線」提示元件（離線且無快取時顯示）

**檢查點**: 此時使用者故事 7 應可獨立運作

---

## 第 7 階段：收尾與跨領域關注點

**目的**: 影響多個使用者故事的改善

- [x] T033 [P] 實作載入狀態（Skeleton Loading）在 RecommendationList.vue
- [x] T034 [P] 實作錯誤狀態與重試按鈕在 NearbyView.vue
- [x] T035 [P] 實作空結果狀態（「附近沒有找到推薦地點」）
- [x] T036 [P] 實作地圖載入失敗時的降級處理（僅顯示清單）
- [x] T037 檢查並優化 iPhone SE 響應式佈局
- [x] T038 執行 `npm run build` 確認無錯誤
- [ ] T039 執行 quickstart.md 驗證流程

---

## 相依性與執行順序

### 階段相依性

- **環境設定（第 1 階段）**: 無相依性 - 可立即開始
- **基礎建設（第 2 階段）**: 依賴環境設定完成 - 阻塞所有使用者故事
- **使用者故事（第 3 階段以後）**: 全部依賴基礎建設階段完成
  - 使用者故事可依優先級順序執行（P1 → P2 → P3）
- **收尾（最後階段）**: 依賴所有預期使用者故事完成

### 使用者故事相依性

- **使用者故事 1+2+3 (P1)**: 基礎建設完成後可開始 - 核心 MVP
- **使用者故事 4 (P2)**: 基礎建設完成後可開始 - 可與 US5+6 平行
- **使用者故事 5+6 (P2)**: 基礎建設完成後可開始 - 可與 US4 平行
- **使用者故事 7 (P3)**: 依賴 US1+2+3 完成（需要有基本搜尋功能才能測試快取）

### 各使用者故事內部順序

- 元件先於頁面整合
- 服務層先於 UI 層
- 核心功能先於錯誤處理

### 平行化機會

- T002, T003 可平行（建立目錄）
- T004, T007, T009 可平行（介面定義）
- T013, T014, T015 可平行（獨立元件）
- T020-T022 (US4) 和 T023-T027 (US5+6) 可平行

---

## 平行化範例：第 3 階段

```bash
# 同時啟動使用者故事 1、2、3 的獨立元件：
任務: "建立附近推薦按鈕元件 src/components/recommendations/NearbyButton.vue"
任務: "建立推薦卡片元件 src/components/recommendations/RecommendationCard.vue"
任務: "建立類別篩選元件 src/components/recommendations/CategoryFilter.vue"
任務: "建立推薦元件樣式 src/assets/styles/recommendations.css"
```

---

## 實作策略

### MVP 優先（使用者故事 1+2+3）

1. 完成第 1 階段：環境設定
2. 完成第 2 階段：基礎建設（關鍵 - 阻塞所有故事）
3. 完成第 3 階段：使用者故事 1+2+3
4. **停止並驗證**: 獨立測試核心推薦功能
5. 若就緒則部署/展示

### 增量交付

1. 完成環境設定 + 基礎建設 → 基礎就緒
2. 新增 US1+2+3 → 獨立測試 → 部署/展示 (MVP!)
3. 新增 US4 (地圖) → 獨立測試 → 部署/展示
4. 新增 US5+6 (詳情+導航) → 獨立測試 → 部署/展示
5. 新增 US7 (離線) → 獨立測試 → 部署/展示
6. 完成收尾 → 最終驗證

---

## 任務統計

| 階段 | 任務數量 |
|------|----------|
| 第 1 階段：環境設定 | 3 |
| 第 2 階段：基礎建設 | 9 |
| 第 3 階段：US1+2+3 (P1) | 7 |
| 第 4 階段：US4 (P2) | 3 |
| 第 5 階段：US5+6 (P2) | 5 |
| 第 6 階段：US7 (P3) | 5 |
| 第 7 階段：收尾 | 7 |
| **總計** | **39** |

---

## 備註

- [P] 任務 = 不同檔案、無相依性
- [故事] 標籤將任務對應到特定使用者故事以便追蹤
- 各使用者故事應可獨立完成與測試
- 每個任務或邏輯群組完成後提交
- 可在任何檢查點停止以獨立驗證故事
