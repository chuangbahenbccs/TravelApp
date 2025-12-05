/**
 * 推薦功能型別定義
 *
 * @module types/recommendation
 */

// ============================================================================
// 基礎型別
// ============================================================================

/** 地點類型 */
export type PlaceType = 'restaurant' | 'attraction';

/** 價格等級 (1-4) */
export type PriceLevel = 1 | 2 | 3 | 4;

/** 營業狀態推測 */
export type ClosedBucket =
  | 'VeryLikelyOpen'
  | 'LikelyOpen'
  | 'Unsure'
  | 'LikelyClosed'
  | 'VeryLikelyClosed';

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
  periods?: {
    day: number; // 0=Sunday, 6=Saturday
    open: string; // "HH:MM"
    close: string; // "HH:MM"
  }[];
}

// ============================================================================
// 推薦地點
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
  closedBucket?: ClosedBucket;
}

/** 推薦地點（詳細資訊） */
export interface PlaceDetails extends PlaceSummary {
  description?: string;
  photos: PlacePhoto[];
  hours?: OpeningHours;
  website?: string;
  phone?: string;
}

// ============================================================================
// 搜尋中心點
// ============================================================================

/** 搜尋中心點 */
export interface SearchCenter {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  searchedAt: Date;
}

// ============================================================================
// 快取
// ============================================================================

/** 快取的推薦結果 */
export interface RecommendationCache {
  id?: number;
  centerKey: string;
  center: SearchCenter;
  places: PlaceSummary[];
  cachedAt: Date;
  expiresAt: Date;
}

// ============================================================================
// 狀態
// ============================================================================

/** 推薦載入狀態 */
export type RecommendationStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'offline';

/** 推薦功能狀態 */
export interface RecommendationState {
  status: RecommendationStatus;
  center: SearchCenter | null;
  places: PlaceSummary[];
  filteredPlaces: PlaceSummary[];
  activeFilter: PlaceType | 'all';
  error: string | null;
  isFromCache: boolean;
  cacheAge?: Date;
}

// ============================================================================
// 搜尋參數與結果
// ============================================================================

/** 附近搜尋參數 */
export interface NearbySearchParams {
  center: Coordinates;
  radius?: number;
  types?: PlaceType[];
  limit?: number;
  cursor?: string;
}

/** 搜尋結果 */
export interface NearbySearchResult {
  places: PlaceSummary[];
  nextCursor?: string;
  totalResults?: number;
}

/** Geocoding 參數 */
export interface GeocodeParams {
  query: string;
  near?: Coordinates;
}

/** Geocoding 結果 */
export interface GeocodeResult {
  name: string;
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

// ============================================================================
// 工具函式
// ============================================================================

/** 快取過期時間（毫秒）- 7 天 */
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 產生快取鍵值
 */
export function generateCacheKey(
  coordinates: Coordinates,
  radius: number
): string {
  const roundedLat = Math.round(coordinates.latitude * 10000) / 10000;
  const roundedLng = Math.round(coordinates.longitude * 10000) / 10000;
  return `${roundedLat}_${roundedLng}_${radius}`;
}

/**
 * 建立快取資料物件
 */
export function createCachedRecommendation(
  center: SearchCenter,
  places: PlaceSummary[]
): RecommendationCache {
  const now = new Date();
  return {
    centerKey: generateCacheKey(
      { latitude: center.latitude, longitude: center.longitude },
      center.radius
    ),
    center,
    places,
    cachedAt: now,
    expiresAt: new Date(now.getTime() + CACHE_TTL_MS),
  };
}

/**
 * 檢查快取是否已過期
 */
export function isCacheExpired(cache: RecommendationCache): boolean {
  return new Date() > cache.expiresAt;
}

/**
 * 計算快取年齡描述
 */
export function formatCacheAge(cache: RecommendationCache): string {
  const ageMs = Date.now() - cache.cachedAt.getTime();
  const ageMinutes = Math.floor(ageMs / (60 * 1000));
  const ageHours = Math.floor(ageMs / (60 * 60 * 1000));
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

  if (ageMinutes < 1) return '剛剛';
  if (ageMinutes < 60) return `${ageMinutes} 分鐘前`;
  if (ageHours < 24) return `${ageHours} 小時前`;
  return `${ageDays} 天前`;
}

/**
 * 產生 Google Maps 導航 URL
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
 */
export function convertRatingTo5Stars(rating: number): number {
  return Math.round((rating / 2) * 10) / 10;
}

/**
 * 格式化距離顯示
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 格式化價格等級顯示
 */
export function formatPriceLevel(level: PriceLevel): string {
  return '$'.repeat(level);
}
