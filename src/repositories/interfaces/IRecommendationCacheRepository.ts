/**
 * 推薦快取 Repository 介面
 *
 * 定義推薦資料快取的儲存介面
 *
 * @module repositories/interfaces/IRecommendationCacheRepository
 */

import type { RecommendationCache, SearchCenter } from '@/types/recommendation';

/**
 * 推薦快取 Repository 介面
 */
export interface IRecommendationCacheRepository {
  /**
   * 根據快取鍵值取得快取資料
   * @param centerKey - 快取鍵值
   * @returns 快取資料，不存在或已過期時回傳 null
   */
  get(centerKey: string): Promise<RecommendationCache | null>;

  /**
   * 根據快取鍵值取得快取資料（包含已過期的）
   * 用於離線時顯示過期但仍可用的資料
   * @param centerKey - 快取鍵值
   * @returns 快取資料，不存在時回傳 null
   */
  getIncludingExpired(centerKey: string): Promise<RecommendationCache | null>;

  /**
   * 儲存快取資料
   * 若已存在相同 centerKey 的快取，則覆蓋
   * @param data - 要快取的資料
   */
  set(data: RecommendationCache): Promise<void>;

  /**
   * 刪除特定快取
   * @param centerKey - 快取鍵值
   */
  delete(centerKey: string): Promise<void>;

  /**
   * 清除所有過期的快取
   * @returns 清除的快取數量
   */
  clearExpired(): Promise<number>;

  /**
   * 清除所有快取
   */
  clearAll(): Promise<void>;

  /**
   * 取得所有已快取的搜尋中心點
   * 用於顯示「最近搜尋」列表
   * @param limit - 回傳數量限制，預設 10
   * @returns 搜尋中心點列表，按搜尋時間降序排列
   */
  getRecentSearches(limit?: number): Promise<SearchCenter[]>;
}
