/**
 * Places Provider 介面契約
 *
 * 定義地點資料提供者的抽象介面，支援未來切換資料來源（如 Google Places）
 *
 * @module contracts/places-provider
 */

// ============================================================================
// 基礎型別
// ============================================================================

/** 地點類型 */
export type PlaceType = 'restaurant' | 'attraction';

/** 價格等級 */
export type PriceLevel = 1 | 2 | 3 | 4;

/** 座標 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** 類別資訊 */
export interface PlaceCategory {
  id: string;
  name: string;
  iconUrl?: string;
}

/** 照片資訊 */
export interface PlacePhoto {
  id: string;
  url: string;
  width: number;
  height: number;
}

/** 營業時間 */
export interface OpeningHours {
  display: string;
  isOpenNow?: boolean;
}

// ============================================================================
// 搜尋參數
// ============================================================================

/** 附近搜尋參數 */
export interface NearbySearchParams {
  /** 搜尋中心點座標 */
  center: Coordinates;

  /** 搜尋半徑（公尺），預設 1000 */
  radius?: number;

  /** 篩選類型（不指定則搜尋全部） */
  types?: PlaceType[];

  /** 結果數量限制，預設 20 */
  limit?: number;

  /** 分頁 cursor（用於載入更多） */
  cursor?: string;
}

/** Geocoding 參數 */
export interface GeocodeParams {
  /** 地點名稱查詢 */
  query: string;

  /** 偏好搜尋中心點（可選） */
  near?: Coordinates;
}

// ============================================================================
// 回應型別
// ============================================================================

/** 推薦地點（簡要資訊，用於清單顯示） */
export interface PlaceSummary {
  id: string;
  name: string;
  type: PlaceType;
  latitude: number;
  longitude: number;
  distance: number;
  address: string;
  rating?: number;
  priceLevel?: PriceLevel;
  categories: PlaceCategory[];
  thumbnailUrl?: string;
  isOpenNow?: boolean;
}

/** 推薦地點（詳細資訊） */
export interface PlaceDetails extends PlaceSummary {
  description?: string;
  photos: PlacePhoto[];
  hours?: OpeningHours;
  website?: string;
  phone?: string;
}

/** 搜尋結果 */
export interface NearbySearchResult {
  places: PlaceSummary[];
  nextCursor?: string;
  totalResults?: number;
}

/** Geocoding 結果 */
export interface GeocodeResult {
  name: string;
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

// ============================================================================
// Provider 介面
// ============================================================================

/**
 * 地點資料提供者介面
 *
 * @example
 * ```typescript
 * // Foursquare 實作
 * const provider: IPlacesProvider = new FoursquarePlacesProvider(apiKey);
 *
 * // 搜尋附近
 * const result = await provider.searchNearby({
 *   center: { latitude: 35.7147, longitude: 139.7772 },
 *   radius: 1000,
 *   types: ['restaurant'],
 * });
 *
 * // 取得詳情
 * const details = await provider.getPlaceDetails(result.places[0].id);
 * ```
 */
export interface IPlacesProvider {
  /**
   * 搜尋附近地點
   *
   * @param params - 搜尋參數
   * @returns 搜尋結果
   * @throws NetworkError - 網路錯誤
   * @throws RateLimitError - 超過 API 呼叫限制
   */
  searchNearby(params: NearbySearchParams): Promise<NearbySearchResult>;

  /**
   * 取得地點詳細資訊
   *
   * @param placeId - 地點 ID
   * @returns 地點詳情
   * @throws NotFoundError - 地點不存在
   * @throws NetworkError - 網路錯誤
   */
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;

  /**
   * 將地點名稱轉換為座標
   *
   * @param params - Geocoding 參數
   * @returns Geocoding 結果，找不到時回傳 null
   * @throws NetworkError - 網路錯誤
   */
  geocode(params: GeocodeParams): Promise<GeocodeResult | null>;
}

// ============================================================================
// 錯誤型別
// ============================================================================

/** 基礎 Provider 錯誤 */
export class PlacesProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'PlacesProviderError';
  }
}

/** 網路錯誤 */
export class NetworkError extends PlacesProviderError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

/** API 速率限制錯誤 */
export class RateLimitError extends PlacesProviderError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    cause?: Error
  ) {
    super(message, 'RATE_LIMIT_ERROR', cause);
    this.name = 'RateLimitError';
  }
}

/** 地點不存在錯誤 */
export class NotFoundError extends PlacesProviderError {
  constructor(message: string, cause?: Error) {
    super(message, 'NOT_FOUND_ERROR', cause);
    this.name = 'NotFoundError';
  }
}

// ============================================================================
// 工具函式型別
// ============================================================================

/**
 * 產生 Google Maps 導航 URL
 *
 * @param destination - 目的地座標
 * @param destinationName - 目的地名稱（可選，用於顯示）
 * @returns Google Maps 導航 URL
 */
export function generateNavigationUrl(
  destination: Coordinates,
  destinationName?: string
): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: 'walking',
  });

  if (destinationName) {
    params.set('destination_place_id', destinationName);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * 將 Foursquare 評分 (0-10) 轉換為 5 星制
 *
 * @param rating - Foursquare 評分 (0-10)
 * @returns 5 星制評分 (0-5)
 */
export function convertRatingTo5Stars(rating: number): number {
  return Math.round((rating / 2) * 10) / 10;
}

/**
 * 格式化距離顯示
 *
 * @param meters - 距離（公尺）
 * @returns 格式化字串（如「500m」或「1.2km」）
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 格式化價格等級顯示
 *
 * @param level - 價格等級 (1-4)
 * @returns 顯示字串（如「$」「$$」「$$$」「$$$$」）
 */
export function formatPriceLevel(level: PriceLevel): string {
  return '$'.repeat(level);
}
