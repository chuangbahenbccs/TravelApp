# 實作計畫：每日行程瀏覽功能

**分支**: `001-daily-itinerary-viewer` | **日期**: 2025-11-27 | **規格**: [spec.md](spec.md)
**輸入**: 功能規格來自 `/specs/001-daily-itinerary-viewer/spec.md`

## 摘要

實作一個 Vue 3 PWA 旅遊行程瀏覽應用程式，使用者可以：
- 查看每日行程卡片（活動、餐廳、交通）
- 一眼辨識不同類型的卡片（藍色活動、橘色餐廳、灰色交通）
- 一鍵導航至目的地（整合 Google Maps）
- 展開卡片查看詳細資訊
- 切換不同天數的行程
- 離線使用（PWA + IndexedDB）

## 技術背景

**語言/版本**: TypeScript 5.6, Vue 3.5 (Composition API)
**主要依賴**: vue-router@4, pinia@2, dexie@4, vite-plugin-pwa@0.21
**儲存方案**: IndexedDB (透過 Dexie.js)
**測試框架**: 尚未設定（可後續加入 Vitest）
**目標平台**: 行動瀏覽器（PWA），支援 iOS Safari, Android Chrome
**專案類型**: 單體前端網頁應用程式
**效能目標**: 首次載入 < 2秒, 切換天數 < 0.5秒
**限制條件**: 離線可用, 觸控目標 ≥ 44px, 支援 iPhone SE 最小螢幕
**規模/範圍**: 6 天行程, 約 30-50 張卡片

## 憲法檢核

*依據 `.specify/constitution.md` 進行檢核*

- ✅ 使用 TypeScript 嚴格模式
- ✅ Repository 模式抽象資料存取
- ✅ 元件化設計（卡片元件可重用）
- ✅ CSS 變數管理主題色彩
- ✅ 行動優先響應式設計

## 專案結構

### 文件結構（本功能）

```text
specs/001-daily-itinerary-viewer/
├── spec.md              # 功能規格（6 個使用者故事）
├── plan.md              # 本檔案（技術實作計畫）
└── tasks.md             # 任務清單（44 項任務）
```

### 原始碼結構（專案根目錄）

```text
src/
├── assets/
│   └── styles/
│       ├── variables.css    # CSS 變數（日式極簡主題）
│       ├── reset.css        # CSS Reset
│       └── global.css       # 全域樣式
├── components/
│   ├── cards/
│   │   ├── BaseCard.vue         # 基礎卡片元件（展開/收合）
│   │   ├── ActivityCard.vue     # 活動卡片（藍色）
│   │   ├── RestaurantCard.vue   # 餐廳卡片（橘色）
│   │   └── TransportCard.vue    # 交通卡片（灰色）
│   ├── layout/
│   │   └── RouteSummary.vue     # 路線摘要元件
│   └── navigation/
│       ├── DaySelector.vue      # 天數選擇器
│       └── NavigateButton.vue   # 導航按鈕
├── composables/
│   └── useDayPlan.ts        # 每日行程 Composable
├── database/
│   ├── db.ts                # Dexie 資料庫實例
│   └── seed.ts              # 資料初始化邏輯
├── repositories/
│   ├── implementations/
│   │   ├── DexieDayPlanRepository.ts
│   │   └── DexieTripRepository.ts
│   └── interfaces/
│       ├── IDayPlanRepository.ts
│       └── ITripRepository.ts
├── router/
│   └── index.ts             # Vue Router 設定
├── stores/
│   └── tripStore.ts         # Pinia Store
├── types/
│   ├── index.ts             # 基礎型別（Location, BackupOption, CardType）
│   ├── card.ts              # 卡片型別（ActivityCard, RestaurantCard, TransportCard）
│   ├── day.ts               # 每日行程型別（DayPlan, RouteSummary）
│   └── trip.ts              # 旅程型別（Trip, Traveler, Accommodation）
├── views/
│   └── DayView.vue          # 每日行程頁面
├── App.vue                  # 根元件
└── main.ts                  # 應用程式進入點

data/
└── trips/
    ├── japan-2026-spring.json   # 旅程主檔
    ├── day1.json ~ day6.json    # 每日行程資料

public/
├── icon-192.png             # PWA 圖示
└── icon-512.png             # PWA 圖示
```

**結構決策**: 採用單體前端專案結構，使用 Repository 模式抽象 IndexedDB 存取，以便未來可替換為 API 呼叫。

## 技術決策

### 狀態管理
- 使用 Pinia 管理全域狀態（當前旅程、載入狀態）
- 使用 Composable (`useDayPlan`) 管理每日行程邏輯
- 卡片展開狀態透過 `expandedCardId` ref 追蹤

### 資料存取
- Repository 模式：`ITripRepository` / `IDayPlanRepository` 介面
- Dexie.js 實作 IndexedDB 存取
- 應用程式啟動時自動從 JSON 檔案載入種子資料

### 卡片元件設計
- `BaseCard.vue` 提供共用的展開/收合動畫與結構
- 三種特化卡片繼承基礎卡片，各自定義顏色與詳細資訊區塊
- Type Guard 函式 (`isActivityCard`, `isRestaurantCard`, `isTransportCard`) 確保型別安全

### PWA 配置
- 使用 vite-plugin-pwa 自動產生 Service Worker
- Workbox 策略：CacheFirst（靜態資源）、NetworkFirst（API）
- 支援離線使用與安裝到主畫面

### 路由設計
- `/` - 重導向至 `/day/1`
- `/day/:dayNumber` - 每日行程頁面

## 複雜度追蹤

| 違規項目 | 為何需要 | 為何拒絕更簡單的替代方案 |
|----------|----------|--------------------------|
| Repository 模式 | 抽象 IndexedDB 存取，未來可替換為 API | 直接存取 Dexie 會導致業務邏輯與資料存取耦合 |

## 實作階段

1. **環境設定** - Vue 3 + TypeScript + Vite 專案初始化
2. **基礎建設** - 型別定義、CSS 變數、資料庫設定、Repository
3. **US1 查看每日行程** - DayView 頁面、useDayPlan composable
4. **US2 卡片類型區分** - BaseCard、ActivityCard、RestaurantCard、TransportCard
5. **US3 一鍵導航** - NavigateButton 元件整合
6. **US4 卡片詳細資訊** - 展開/收合動畫、詳細資訊區塊
7. **US5 路線總覽** - RouteSummary 元件
8. **US6 天數切換** - DaySelector 元件、路由跳轉
9. **收尾** - PWA 圖示、離線驗證、建置確認

詳細任務清單請參閱 [tasks.md](tasks.md)。
