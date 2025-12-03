# 功能規格：Google Places API 遷移

**功能分支**: `003-google-places-migration`
**建立日期**: 2025-12-03
**狀態**: 草稿
**輸入**: 使用者描述: "將 Foursquare Places API 遷移至 Google Places API，以獲得更準確的餐廳/景點類別判斷"

## 遷移背景

Foursquare Places API 的類別判斷不夠準確，餐廳經常被誤判為景點。Google Places API 提供更結構化的類型系統（`types` 陣列直接包含 `restaurant`、`cafe`、`tourist_attraction` 等），類別判斷更準確。

## 使用者情境與測試 *（必填）*

### 使用者故事 1 - 準確的餐廳分類 (優先級: P1)

身為旅行者，當我查看附近推薦時，我希望所有餐廳都被正確分類為「餐廳」而非「景點」，以便我能快速找到用餐地點。

**優先級理由**: 這是遷移的核心目的，解決 Foursquare API 類別判斷不準確的問題。

**獨立測試方式**: 可透過搜尋包含拉麵店、壽司店等日式餐廳的地點，確認它們被正確分類為餐廳來測試。

**驗收情境**:

1. **假設** 搜尋結果包含一家拉麵店，**當** 查看推薦清單，**則** 該店顯示為「餐廳」類型
2. **假設** 搜尋結果包含一家咖啡廳，**當** 查看推薦清單，**則** 該店顯示為「餐廳」類型
3. **假設** 搜尋結果包含一家居酒屋，**當** 查看推薦清單，**則** 該店顯示為「餐廳」類型

---

### 使用者故事 2 - 準確的景點分類 (優先級: P1)

身為旅行者，當我查看附近推薦時，我希望博物館、公園、觀光景點被正確分類為「景點」，以便我能規劃觀光行程。

**優先級理由**: 與餐廳分類同等重要，確保景點類型正確。

**獨立測試方式**: 可透過搜尋包含博物館、公園的地點，確認它們被正確分類為景點來測試。

**驗收情境**:

1. **假設** 搜尋結果包含一座博物館，**當** 查看推薦清單，**則** 該地顯示為「景點」類型
2. **假設** 搜尋結果包含一座公園，**當** 查看推薦清單，**則** 該地顯示為「景點」類型
3. **假設** 搜尋結果包含一個觀光景點，**當** 查看推薦清單，**則** 該地顯示為「景點」類型

---

### 使用者故事 3 - 維持現有功能 (優先級: P1)

身為旅行者，我希望遷移後的推薦功能與之前相同，包括篩選、地圖顯示、詳情查看等，不會因為 API 更換而失去功能。

**優先級理由**: 確保遷移不會造成功能退化。

**獨立測試方式**: 可透過執行所有現有的推薦功能測試案例來驗證。

**驗收情境**:

1. **假設** 使用者點擊「附近推薦」按鈕，**當** API 回傳結果，**則** 顯示推薦清單（與之前行為相同）
2. **假設** 使用者選擇「餐廳」篩選，**當** 清單更新，**則** 只顯示餐廳類型
3. **假設** 使用者點擊推薦項目，**當** 詳情載入，**則** 顯示完整地點資訊

---

### 使用者故事 4 - 離線快取支援 (優先級: P2)

身為旅行者，我希望使用 Google Places API 後仍能在離線時查看之前搜尋過的推薦結果。

**優先級理由**: 維持離線優先的設計原則。

**獨立測試方式**: 可透過先搜尋一個地點，然後在離線狀態下再次查看來測試。

**驗收情境**:

1. **假設** 使用者之前已搜尋某地點的推薦，**當** 在離線狀態下再次查看，**則** 顯示快取的結果
2. **假設** 快取資料在 7 天內，**當** 查看快取結果，**則** 資料正常顯示

---

### 邊界情況

- 當 Google API Key 未設定或無效時，顯示適當的錯誤訊息
- 當 Google API 達到配額限制時，顯示友善提示並嘗試使用快取
- 當網路請求失敗時，回退使用快取資料（若有）
- 當 API 回傳空結果時，顯示「附近沒有找到推薦地點」

## 需求 *（必填）*

### 功能需求

- **FR-001**: 系統必須使用 Google Places API (New) 作為地點搜尋資料來源
- **FR-002**: 系統必須透過 `types` 陣列判斷地點類型（restaurant、cafe → 餐廳；tourist_attraction、museum、park → 景點）
- **FR-003**: 系統必須支援 `POST /places:searchNearby` 端點進行附近搜尋
- **FR-004**: 系統必須支援 `GET /places/{placeId}` 端點取得地點詳情
- **FR-005**: 系統必須透過 Vite 代理處理 CORS（開發環境）
- **FR-006**: 系統必須保留 IPlacesProvider 介面，確保 Provider 可切換
- **FR-007**: 系統必須保留 FoursquarePlacesProvider 作為備用方案
- **FR-008**: 系統必須使用環境變數 `VITE_GOOGLE_PLACES_API_KEY` 存取 API Key

### 關鍵實體

- **GooglePlacesProvider**: 實作 IPlacesProvider 介面，使用 Google Places API (New)
- **PlaceSummary / PlaceDetails**: 維持現有資料結構，僅更換資料來源

## 成功標準 *（必填）*

### 可衡量成果

- **SC-001**: 100% 的餐廳類型地點（restaurant、cafe、bar、bakery）被正確分類為餐廳
- **SC-002**: 100% 的景點類型地點（tourist_attraction、museum、park）被正確分類為景點
- **SC-003**: 推薦清單載入時間維持在 3 秒內
- **SC-004**: 所有現有功能測試通過（無功能退化）
- **SC-005**: 離線快取功能正常運作

## 假設與限制

### 假設

- Google Places API 免費額度（$200/月）足以支援開發和初期使用
- 使用者已取得有效的 Google Places API Key
- 開發環境使用 Vite 代理，生產環境需要後端代理

### 限制

- 需要配置 Google Cloud Console 並啟用 Places API
- API Key 需設定 HTTP Referrer 限制以確保安全
- 生產環境需要後端代理處理 CORS（Cloudflare Workers / Vercel Edge Functions）

## 技術規格

### Google Places API (New) 端點

```
Base URL: https://places.googleapis.com/v1
認證: X-Goog-Api-Key header
版本: Places API (New)

端點:
- POST /places:searchNearby - 附近搜尋
- GET /places/{placeId} - 地點詳情

類型篩選:
- includedTypes: ["restaurant", "cafe", "bar"] - 餐廳
- includedTypes: ["tourist_attraction", "museum", "park"] - 景點

回傳欄位（FieldMask）:
- places.id
- places.displayName
- places.location
- places.types
- places.formattedAddress
- places.rating
- places.priceLevel
- places.photos
```

### 類型對應

| 我們的類型 | Google Places types |
|-----------|---------------------|
| restaurant | restaurant, cafe, bar, bakery, meal_delivery, meal_takeaway |
| attraction | tourist_attraction, museum, park, amusement_park, zoo, aquarium |
