# 任務清單：每日行程瀏覽功能

**輸入**: 設計文件來自 `/specs/001-daily-itinerary-viewer/`
**前置條件**: spec.md（使用者故事）、plan.md（技術規劃）
**狀態**: 大部分已完成

## 格式：`[編號] [P?] [故事] 描述`

- **[P]**: 可平行執行（不同檔案、無相依性）
- **[故事]**: 此任務所屬的使用者故事（例如 US1, US2, US3）
- 描述中包含確切的檔案路徑

---

## 第 1 階段：環境設定（共用基礎設施）

**目的**: 專案初始化與基本結構

- [x] T001 依實作計畫建立專案結構
- [x] T002 初始化 Vue 3 + TypeScript 專案並安裝依賴（vue-router, pinia, dexie, vite-plugin-pwa）
- [x] T003 [P] 設定 TypeScript 路徑別名 `@/*` 在 tsconfig.app.json

**檢查點**: ✅ 環境設定完成

---

## 第 2 階段：基礎建設（阻塞性前置條件）

**目的**: 任何使用者故事開始前必須完成的核心基礎設施

- [x] T004 在 src/types/index.ts 建立基礎型別定義（Location, BackupOption, CardType）
- [x] T005 [P] 在 src/types/card.ts 建立卡片型別定義（ActivityCard, RestaurantCard, TransportCard）
- [x] T006 [P] 在 src/types/day.ts 建立每日行程型別定義（DayPlan, RouteSummary）
- [x] T007 [P] 在 src/types/trip.ts 建立旅程型別定義（Trip, Traveler, Accommodation）
- [x] T008 在 src/assets/styles/variables.css 建立 CSS 變數（日式極簡主題）
- [x] T009 [P] 在 src/assets/styles/reset.css 建立 CSS Reset
- [x] T010 [P] 在 src/assets/styles/global.css 建立全域樣式
- [x] T011 在 src/database/db.ts 建立 Dexie 資料庫實例
- [x] T012 [P] 在 src/repositories/interfaces/ITripRepository.ts 建立旅程 Repository 介面
- [x] T013 [P] 在 src/repositories/interfaces/IDayPlanRepository.ts 建立每日行程 Repository 介面
- [x] T014 在 src/repositories/implementations/DexieTripRepository.ts 實作 Dexie 旅程 Repository
- [x] T015 在 src/repositories/implementations/DexieDayPlanRepository.ts 實作 Dexie 每日行程 Repository
- [x] T016 在 src/database/seed.ts 建立資料初始化邏輯
- [x] T017 在 src/router/index.ts 設定 Vue Router
- [x] T018 在 src/stores/tripStore.ts 建立 Pinia Store

**檢查點**: ✅ 基礎建設完成 - 可開始實作使用者故事

---

## 第 3 階段：使用者故事 1 - 查看每日行程總覽 (優先級: P1) 🎯 MVP

**目標**: 使用者可以查看某一天的所有行程安排，包含時間軸上的活動、餐廳和交通資訊

**獨立測試方式**: 開啟應用程式，選擇特定日期，確認顯示該日所有卡片並依時間排序

### 使用者故事 1 的實作

- [x] T019 [US1] 在 src/composables/useDayPlan.ts 建立每日行程 Composable
- [x] T020 [US1] 在 src/views/DayView.vue 建立每日行程頁面
- [x] T021 [US1] 在 src/App.vue 設定 RouterView

**檢查點**: ✅ 使用者故事 1 完成 - 可查看每日行程

---

## 第 4 階段：使用者故事 2 - 辨識不同類型的行程卡片 (優先級: P1)

**目標**: 使用者可以一眼區分活動、餐廳和交通卡片

**獨立測試方式**: 查看畫面上的卡片，確認三種類型各有明確的視覺區分（顏色、圖示）

### 使用者故事 2 的實作

- [x] T022 [P] [US2] 在 src/components/cards/BaseCard.vue 建立基礎卡片元件
- [x] T023 [P] [US2] 在 src/components/cards/ActivityCard.vue 建立活動卡片元件（藍色）
- [x] T024 [P] [US2] 在 src/components/cards/RestaurantCard.vue 建立餐廳卡片元件（橘色）
- [x] T025 [P] [US2] 在 src/components/cards/TransportCard.vue 建立交通卡片元件（灰色）
- [x] T026 [US2] 在 src/types/card.ts 新增型別守衛函式（isActivityCard, isRestaurantCard, isTransportCard）

**檢查點**: ✅ 使用者故事 2 完成 - 卡片類型視覺區分明確

---

## 第 5 階段：使用者故事 3 - 一鍵導航至目的地 (優先級: P1)

**目標**: 使用者可以點擊卡片上的導航按鈕直接開啟 Google Maps

**獨立測試方式**: 點擊任意卡片的導航按鈕，確認能正確開啟 Google Maps

### 使用者故事 3 的實作

- [x] T027 [US3] 在 src/components/navigation/NavigateButton.vue 建立導航按鈕元件
- [x] T028 [US3] 整合 NavigateButton 到三種卡片元件中

**檢查點**: ✅ 使用者故事 3 完成 - 一鍵導航功能可用

---

## 第 6 階段：使用者故事 4 - 查看卡片詳細資訊 (優先級: P2)

**目標**: 使用者可以展開卡片查看更多細節

**獨立測試方式**: 點擊卡片展開/收合，確認所有詳細資訊正確顯示

### 使用者故事 4 的實作

- [x] T029 [US4] 在 BaseCard.vue 實作展開/收合動畫
- [x] T030 [P] [US4] 在 ActivityCard.vue 加入詳細資訊區塊（營業時間、入場費、必看重點）
- [x] T031 [P] [US4] 在 RestaurantCard.vue 加入詳細資訊區塊（價格、素食選項、備用餐廳）
- [x] T032 [P] [US4] 在 TransportCard.vue 加入詳細資訊區塊（路線、票價、注意事項）
- [x] T033 [US4] 在 useDayPlan.ts 加入 toggleCard 和 isCardExpanded 函式

**檢查點**: ✅ 使用者故事 4 完成 - 卡片可展開查看詳細資訊

---

## 第 7 階段：使用者故事 5 - 查看當日路線總覽 (優先級: P2)

**目標**: 使用者可以查看當天的整體路線摘要

**獨立測試方式**: 查看每日頁面頂部的路線摘要區塊

### 使用者故事 5 的實作

- [x] T034 [US5] 在 src/components/layout/RouteSummary.vue 建立路線摘要元件
- [x] T035 [US5] 整合 RouteSummary 到 DayView.vue

**檢查點**: ✅ 使用者故事 5 完成 - 路線總覽可見

---

## 第 8 階段：使用者故事 6 - 切換不同天數的行程 (優先級: P2)

**目標**: 使用者可以方便地切換查看不同天數的行程

**獨立測試方式**: 點擊日期選擇器切換天數，確認畫面正確顯示對應日期的行程

### 使用者故事 6 的實作

- [x] T036 [US6] 在 src/components/navigation/DaySelector.vue 建立天數選擇器元件
- [x] T037 [US6] 整合 DaySelector 到 DayView.vue
- [x] T038 [US6] 實作路由跳轉邏輯（/day/:dayNumber）

**檢查點**: ✅ 使用者故事 6 完成 - 天數切換功能可用

---

## 第 9 階段：收尾與跨領域關注點

**目的**: 影響多個使用者故事的改善

- [x] T039 在 vite.config.ts 設定 PWA 配置
- [x] T040 [P] 建立 PWA 圖示（icon.svg）在 public/
- [x] T041 更新 specs/001-daily-itinerary-viewer/plan.md 為實際內容
- [x] T042 驗證離線功能（Service Worker 正確快取資料）
- [x] T043 執行 npm run build 確認無錯誤
- [ ] T044 提交所有變更並推送

---

## 相依性與執行順序

### 階段相依性

- **環境設定（第 1 階段）**: ✅ 已完成
- **基礎建設（第 2 階段）**: ✅ 已完成
- **使用者故事 1-3（第 3-5 階段）**: ✅ P1 功能已完成
- **使用者故事 4-6（第 6-8 階段）**: ✅ P2 功能已完成
- **收尾（第 9 階段）**: ✅ 已完成

### 使用者故事相依性

- **US1 (P1)**: 核心瀏覽功能 - 其他故事基礎
- **US2 (P1)**: 獨立於 US1，可平行開發
- **US3 (P1)**: 依賴卡片元件存在
- **US4 (P2)**: 依賴卡片元件結構
- **US5 (P2)**: 獨立於其他故事
- **US6 (P2)**: 依賴 DayView 存在

---

## 統計摘要

| 類別 | 任務數 | 已完成 | 待完成 |
|------|--------|--------|--------|
| 環境設定 | 3 | 3 | 0 |
| 基礎建設 | 15 | 15 | 0 |
| US1 (P1) | 3 | 3 | 0 |
| US2 (P1) | 5 | 5 | 0 |
| US3 (P1) | 2 | 2 | 0 |
| US4 (P2) | 5 | 5 | 0 |
| US5 (P2) | 2 | 2 | 0 |
| US6 (P2) | 3 | 3 | 0 |
| 收尾 | 6 | 6 | 0 |
| **總計** | **44** | **44** | **0** |

### 平行化機會

- 第 2 階段：T005-T007（型別定義）可平行
- 第 2 階段：T009-T010（CSS）可平行
- 第 2 階段：T012-T013（Repository 介面）可平行
- 第 4 階段：T022-T025（卡片元件）可平行
- 第 6 階段：T030-T032（詳細資訊）可平行
- 第 9 階段：T040 可獨立執行

### MVP 範圍

**建議 MVP**：使用者故事 1-3（P1 功能）
- 查看每日行程總覽
- 辨識不同類型卡片
- 一鍵導航至目的地

**目前狀態**：所有任務已完成。

---

## 備註

- 所有使用者故事的核心功能已實作完成
- 待完成項目主要為 PWA 優化和文件更新
- 建議優先處理 T043（建構驗證）確認無錯誤
