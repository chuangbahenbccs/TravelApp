# 實作計畫：附近餐廳與景點推薦

**分支**: `002-nearby-recommendations` | **日期**: 2025-11-28 | **規格**: [spec.md](./spec.md)
**輸入**: 功能規格來自 `/specs/002-nearby-recommendations/spec.md`

## 摘要

實作附近餐廳與景點推薦功能，使用者可從行程卡片點擊「附近推薦」按鈕，查看該地點附近的餐廳和景點，並透過嵌入式地圖視覺化呈現。技術方案採用 Foursquare Places API v3 作為資料來源，@vue-leaflet/vue-leaflet 作為地圖元件，架構設計保持抽象化以便未來擴展。

## 技術背景

**語言/版本**: TypeScript ^5.0
**主要依賴**: Vue 3 + Composition API ^3.4, @vue-leaflet/vue-leaflet, Dexie.js ^4.0
**儲存方案**: IndexedDB（透過 Dexie.js），新增 `recommendationCaches` 資料表
**測試框架**: Vitest（待確認現有設定）
**目標平台**: PWA - iPhone Safari 為主，支援「加入主畫面」
**專案類型**: 行動 PWA 前端（純前端，無後端）
**效能目標**: 推薦清單 < 3 秒載入，地圖 < 2 秒載入
**限制條件**: 離線可用（快取 7 天），iPhone SE 最小螢幕支援

## 憲法檢核

*關卡：必須在第 0 階段研究前通過。第 1 階段設計後需重新檢核。*

### 初始檢核（第 0 階段前）

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 行動優先 PWA | ✅ 通過 | UI 設計以 iPhone 為主，觸控優先 |
| II. 資料層抽離 | ✅ 通過 | 使用 IPlacesProvider 介面抽象化 |
| III. 日式極簡設計 | ✅ 通過 | 遵循現有卡片樣式 |
| IV. 離線優先 | ✅ 通過 | 快取搜尋結果 7 天 |
| V. 元件單一職責 | ✅ 通過 | 拆分多個獨立元件 |

### 技術約束檢核

| 項目 | 狀態 | 說明 |
|------|------|------|
| Vue 3 + Composition API | ✅ 符合 | 使用 `<script setup>` 語法 |
| TypeScript | ✅ 符合 | 所有檔案使用 TypeScript |
| Dexie.js | ✅ 符合 | 透過 Repository 存取 |
| 禁止 CSS 框架 | ✅ 符合 | 使用自訂 CSS Variables |
| 禁止硬編碼 API Key | ✅ 符合 | 使用 `VITE_FOURSQUARE_API_KEY` |

### 第 1 階段後重新檢核

| 原則 | 狀態 | 設計決策 |
|------|------|----------|
| II. 資料層抽離 | ✅ 通過 | IPlacesProvider + IRecommendationCacheRepository 介面 |
| IV. 離線優先 | ✅ 通過 | DexieRecommendationCacheRepository 實作快取 |
| V. 元件單一職責 | ✅ 通過 | 6 個獨立元件：NearbyButton, RecommendationList, RecommendationCard, RecommendationMap, PlaceDetailModal, CategoryFilter |

## 專案結構

### 文件結構（本功能）

```text
specs/002-nearby-recommendations/
├── spec.md              # 功能規格
├── plan.md              # 本檔案
├── research.md          # 技術研究
├── data-model.md        # 資料模型
├── quickstart.md        # 快速入門
├── contracts/           # API 契約
│   ├── places-provider.ts
│   └── recommendation-cache.ts
├── checklists/
│   └── requirements.md  # 品質檢查清單
└── tasks.md             # 任務清單（由 /speckit.tasks 產生）
```

### 原始碼結構（專案根目錄）

```text
src/
├── services/
│   └── places/
│       ├── IPlacesProvider.ts           # Provider 介面定義
│       └── FoursquarePlacesProvider.ts  # Foursquare 實作
│
├── repositories/
│   ├── interfaces/
│   │   └── IRecommendationCacheRepository.ts
│   └── implementations/
│       └── DexieRecommendationCacheRepository.ts
│
├── composables/
│   └── useNearbyRecommendations.ts      # 推薦功能主要 composable
│
├── components/
│   ├── cards/
│   │   └── BaseCard.vue                 # 修改：新增「附近推薦」按鈕
│   └── recommendations/                 # 新增目錄
│       ├── NearbyButton.vue             # 附近推薦觸發按鈕
│       ├── RecommendationList.vue       # 推薦清單
│       ├── RecommendationCard.vue       # 推薦項目卡片
│       ├── RecommendationMap.vue        # 嵌入式地圖
│       ├── PlaceDetailModal.vue         # 詳情 Modal
│       └── CategoryFilter.vue           # 類別篩選
│
├── views/
│   └── NearbyView.vue                   # 新增：附近推薦頁面
│
├── router/
│   └── index.ts                         # 修改：新增路由
│
├── database/
│   └── db.ts                            # 修改：新增 recommendationCaches 表
│
└── types/
    └── recommendation.ts                # 新增：型別定義
```

**結構決策**: 採用現有單體前端結構，新增 `services/places/` 目錄作為外部 API 整合層，`components/recommendations/` 作為功能專屬元件目錄。

## 新增技術依賴

| 套件 | 版本 | 用途 |
|------|------|------|
| leaflet | ^1.9 | 地圖核心函式庫 |
| @vue-leaflet/vue-leaflet | ^0.10 | Vue 3 地圖元件 |
| @types/leaflet | ^1.9 | TypeScript 型別定義 |

**安裝指令**：
```bash
npm install leaflet @vue-leaflet/vue-leaflet
npm install -D @types/leaflet
```

## 外部服務整合

### Foursquare Places API v3

| 項目 | 值 |
|------|-----|
| Base URL | `https://api.foursquare.com/v3` |
| 認證方式 | Header: `Authorization: {API_KEY}` |
| 免費額度 | $200/月 ≈ 40,000 次呼叫 |
| 速率限制 | 50 QPS |

**使用端點**：
- `GET /places/search` - 搜尋附近地點
- `GET /places/{fsq_id}` - 取得地點詳情

**類別 ID**：
- `13000` - Dining and Drinking（餐廳）
- `16000` - Landmarks and Outdoors（景點）

### OpenStreetMap

| 項目 | 值 |
|------|-----|
| Tile URL | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| 費用 | 免費 |
| 限制 | 請遵守使用政策，避免大量請求 |

## 路由規劃

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/nearby/:lat/:lng` | NearbyView | 附近推薦頁面 |
| `/nearby/:lat/:lng/:placeId` | NearbyView | 附近推薦 + 詳情 Modal |

**路由參數**：
- `lat`: 緯度
- `lng`: 經度
- `placeId`: 地點 ID（可選，用於直接開啟詳情）

## 複雜度追蹤

> **僅在憲法檢核有違規且需合理化說明時填寫**

| 違規項目 | 為何需要 | 為何拒絕更簡單的替代方案 |
|----------|----------|--------------------------|
| 無 | - | - |

---

## 產出物清單

| 檔案 | 狀態 | 說明 |
|------|------|------|
| research.md | ✅ 完成 | 技術研究文件 |
| data-model.md | ✅ 完成 | 資料模型設計 |
| contracts/places-provider.ts | ✅ 完成 | Provider 介面契約 |
| contracts/recommendation-cache.ts | ✅ 完成 | 快取 Repository 契約 |
| quickstart.md | ✅ 完成 | 快速入門指南 |
| tasks.md | 待產生 | 由 `/speckit.tasks` 產生 |

---

## 下一步

執行 `/speckit.tasks` 產生任務清單，然後進行人工審核後開始實作。
