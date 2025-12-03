/**
 * Recommendation Cache Repository 介面契約
 *
 * 定義推薦資料快取的儲存介面，遵循專案憲法的「資料層抽離」原則
 *
 * @module contracts/recommendation-cache
 */

import type { PlaceSummary, Coordinates } from './places-provider';

// ============================================================================
// 快取資料型別
// ============================================================================

/** 搜尋中心點 */
export interface SearchCenter {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  searchedAt: Date;
}

/** 快取的推薦結果 */
export interface CachedRecommendation {
  /** 自動遞增 ID（由 IndexedDB 產生） */
  id?: number;

  /** 快取鍵值（格式：lat_lng_radius） */
  centerKey: string;

  /** 搜尋中心點資訊 */
  center: SearchCenter;

  /** 推薦地點列表 */
  places: PlaceSummary[];

  /** 快取建立時間 */
  cachedAt: Date;

  /** 快取過期時間 */
  expiresAt: Date;
}

// ============================================================================
// Repository 介面
// ============================================================================

/**
 * 推薦快取 Repository 介面
 *
 * @example
 * ```typescript
 * const repo: IRecommendationCacheRepository = new DexieRecommendationCacheRepository();
 *
 * // 儲存快取
 * await repo.set({
 *   centerKey: '35.7147_139.7772_1000',
 *   center: { name: '上野公園', latitude: 35.7147, longitude: 139.7772, radius: 1000, searchedAt: new Date() },
 *   places: [...],
 *   cachedAt: new Date(),
 *   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
 * });
 *
 * // 讀取快取
 * const cached = await repo.get('35.7147_139.7772_1000');
 * ```
 */
export interface IRecommendationCacheRepository {
  /**
   * 根據快取鍵值取得快取資料
   *
   * @param centerKey - 快取鍵值
   * @returns 快取資料，不存在或已過期時回傳 null
   */
  get(centerKey: string): Promise<CachedRecommendation | null>;

  /**
   * 根據快取鍵值取得快取資料（包含已過期的）
   *
   * 用於離線時顯示過期但仍可用的資料
   *
   * @param centerKey - 快取鍵值
   * @returns 快取資料，不存在時回傳 null
   */
  getIncludingExpired(centerKey: string): Promise<CachedRecommendation | null>;

  /**
   * 儲存快取資料
   *
   * 若已存在相同 centerKey 的快取，則覆蓋
   *
   * @param data - 要快取的資料
   */
  set(data: CachedRecommendation): Promise<void>;

  /**
   * 刪除特定快取
   *
   * @param centerKey - 快取鍵值
   */
  delete(centerKey: string): Promise<void>;

  /**
   * 清除所有過期的快取
   *
   * @returns 清除的快取數量
   */
  clearExpired(): Promise<number>;

  /**
   * 清除所有快取
   */
  clearAll(): Promise<void>;

  /**
   * 取得所有已快取的搜尋中心點
   *
   * 用於顯示「最近搜尋」列表
   *
   * @param limit - 回傳數量限制，預設 10
   * @returns 搜尋中心點列表，按搜尋時間降序排列
   */
  getRecentSearches(limit?: number): Promise<SearchCenter[]>;
}

// ============================================================================
// 工具函式
// ============================================================================

/** 快取過期時間（毫秒） */
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

/**
 * 產生快取鍵值
 *
 * 將座標四捨五入到小數點後 4 位，避免浮點數精度問題
 *
 * @param coordinates - 座標
 * @param radius - 搜尋半徑
 * @returns 快取鍵值
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
 *
 * @param center - 搜尋中心點
 * @param places - 推薦地點列表
 * @returns 快取資料物件
 */
export function createCachedRecommendation(
  center: SearchCenter,
  places: PlaceSummary[]
): CachedRecommendation {
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
 *
 * @param cache - 快取資料
 * @returns 是否已過期
 */
export function isCacheExpired(cache: CachedRecommendation): boolean {
  return new Date() > cache.expiresAt;
}

/**
 * 計算快取年齡
 *
 * @param cache - 快取資料
 * @returns 快取年齡描述（如「5 分鐘前」「2 天前」）
 */
export function formatCacheAge(cache: CachedRecommendation): string {
  const ageMs = Date.now() - cache.cachedAt.getTime();
  const ageMinutes = Math.floor(ageMs / (60 * 1000));
  const ageHours = Math.floor(ageMs / (60 * 60 * 1000));
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

  if (ageMinutes < 1) return '剛剛';
  if (ageMinutes < 60) return `${ageMinutes} 分鐘前`;
  if (ageHours < 24) return `${ageHours} 小時前`;
  return `${ageDays} 天前`;
}
