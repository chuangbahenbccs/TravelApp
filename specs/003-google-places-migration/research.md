# 技術研究：Google Places API (New)

**分支**: `003-google-places-migration` | **日期**: 2025-12-03

## 研究目的

調查 Google Places API (New) 的技術細節，確認其能解決 Foursquare API 類別判斷不準確的問題。

## API 比較

### Foursquare Places API

| 項目 | 說明 |
|------|------|
| Base URL | `https://places-api.foursquare.com` |
| 認證方式 | `Authorization: Bearer {API_KEY}` |
| 類別判斷 | 使用 `fsq_category_id` 和類別名稱 |
| 問題 | 類別過於籠統，需要關鍵字比對，仍有誤判 |

### Google Places API (New)

| 項目 | 說明 |
|------|------|
| Base URL | `https://places.googleapis.com/v1` |
| 認證方式 | `X-Goog-Api-Key: {API_KEY}` |
| 類別判斷 | 使用 `types` 陣列，直接包含 `restaurant`、`cafe`、`tourist_attraction` 等 |
| 優勢 | 類型更精確，無需關鍵字比對 |

## Google Places API (New) 詳細規格

### 認證

```http
X-Goog-Api-Key: YOUR_API_KEY
```

### 附近搜尋 (Nearby Search)

**端點**: `POST /v1/places:searchNearby`

**Headers**:
```http
Content-Type: application/json
X-Goog-Api-Key: {API_KEY}
X-Goog-FieldMask: places.id,places.displayName,places.location,places.types,places.formattedAddress,places.rating,places.priceLevel,places.photos
```

**Request Body**:
```json
{
  "locationRestriction": {
    "circle": {
      "center": {
        "latitude": 35.7147,
        "longitude": 139.7967
      },
      "radius": 1000.0
    }
  },
  "includedTypes": ["restaurant", "cafe"],
  "maxResultCount": 20
}
```

**Response**:
```json
{
  "places": [
    {
      "id": "ChIJ...",
      "displayName": {
        "text": "拉麵一蘭",
        "languageCode": "ja"
      },
      "location": {
        "latitude": 35.7150,
        "longitude": 139.7970
      },
      "types": [
        "restaurant",
        "ramen_restaurant",
        "food",
        "point_of_interest",
        "establishment"
      ],
      "formattedAddress": "東京都台東区...",
      "rating": 4.5,
      "priceLevel": "PRICE_LEVEL_MODERATE",
      "photos": [
        {
          "name": "places/ChIJ.../photos/...",
          "widthPx": 4032,
          "heightPx": 3024
        }
      ]
    }
  ]
}
```

### 地點詳情 (Place Details)

**端點**: `GET /v1/places/{placeId}`

**Headers**:
```http
X-Goog-Api-Key: {API_KEY}
X-Goog-FieldMask: id,displayName,location,types,formattedAddress,rating,priceLevel,photos,regularOpeningHours,websiteUri,nationalPhoneNumber
```

### FieldMask（欄位遮罩）

Google Places API (New) 使用 FieldMask 控制回傳欄位，影響計費：

| 類別 | 欄位 |
|------|------|
| Basic | id, displayName, location, types, formattedAddress |
| Advanced | rating, priceLevel, photos, regularOpeningHours |
| Preferred | websiteUri, nationalPhoneNumber |

### 類型 (Types)

Google Places API 的 `types` 陣列包含多個類型，常見類型：

**餐廳類**:
- `restaurant`
- `cafe`
- `bar`
- `bakery`
- `meal_delivery`
- `meal_takeaway`
- `ramen_restaurant`
- `sushi_restaurant`

**景點類**:
- `tourist_attraction`
- `museum`
- `park`
- `amusement_park`
- `zoo`
- `aquarium`
- `art_gallery`

### 價格等級

```typescript
type PriceLevel =
  | "PRICE_LEVEL_UNSPECIFIED"
  | "PRICE_LEVEL_FREE"
  | "PRICE_LEVEL_INEXPENSIVE"
  | "PRICE_LEVEL_MODERATE"
  | "PRICE_LEVEL_EXPENSIVE"
  | "PRICE_LEVEL_VERY_EXPENSIVE";
```

## 計費

| 項目 | 免費額度 | 超額費用 |
|------|----------|----------|
| 每月免費額度 | $200 | - |
| Nearby Search (Basic) | $32/1000 次 | - |
| Nearby Search (Advanced) | $35/1000 次 | - |
| Place Details (Basic) | $17/1000 次 | - |
| Place Details (Advanced) | $20/1000 次 | - |

## CORS 處理

Google Places API 不支援瀏覽器直接呼叫（CORS 限制），需要：

1. **開發環境**: 使用 Vite 代理
2. **生產環境**: 使用後端代理（Cloudflare Workers / Vercel Edge Functions）

### Vite 代理設定

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api/google-places': {
      target: 'https://places.googleapis.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/google-places/, ''),
    }
  }
}
```

## 類型判斷策略

使用 `types` 陣列中的第一個匹配類型判斷：

```typescript
const RESTAURANT_TYPES = [
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'meal_delivery',
  'meal_takeaway',
];

const ATTRACTION_TYPES = [
  'tourist_attraction',
  'museum',
  'park',
  'amusement_park',
  'zoo',
  'aquarium',
];

function determineType(types: string[]): 'restaurant' | 'attraction' {
  if (types.some(t => RESTAURANT_TYPES.includes(t))) {
    return 'restaurant';
  }
  return 'attraction';
}
```

## 結論

Google Places API (New) 提供更結構化的類型系統，`types` 陣列直接包含 `restaurant`、`cafe`、`tourist_attraction` 等類型，無需透過關鍵字比對，能更準確地判斷地點類型。

### 優點

1. 類型判斷更準確
2. 結構化的 API 回應
3. 完善的文件和支援

### 缺點

1. 需要處理 CORS（需要代理）
2. 費用較 Foursquare 略高
3. 需要設定 Google Cloud Console

### 建議

遷移至 Google Places API (New)，並保留 Foursquare Provider 作為備用方案。
