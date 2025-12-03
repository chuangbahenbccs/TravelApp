/**
 * Dexie 推薦快取 Repository 實作
 *
 * 使用 IndexedDB（透過 Dexie.js）儲存推薦快取
 *
 * @module repositories/implementations/DexieRecommendationCacheRepository
 */

import { db } from '@/database/db';
import type { IRecommendationCacheRepository } from '../interfaces/IRecommendationCacheRepository';
import type { RecommendationCache, SearchCenter } from '@/types/recommendation';
import { isCacheExpired } from '@/types/recommendation';

/**
 * Dexie 推薦快取 Repository
 */
export class DexieRecommendationCacheRepository
  implements IRecommendationCacheRepository
{
  /**
   * 根據快取鍵值取得快取資料（不含過期）
   */
  async get(centerKey: string): Promise<RecommendationCache | null> {
    const cache = await db.recommendationCaches
      .where('centerKey')
      .equals(centerKey)
      .first();

    if (!cache) {
      return null;
    }

    // 轉換日期字串為 Date 物件
    const normalizedCache = this.normalizeCache(cache);

    // 檢查是否過期
    if (isCacheExpired(normalizedCache)) {
      return null;
    }

    return normalizedCache;
  }

  /**
   * 根據快取鍵值取得快取資料（包含過期）
   */
  async getIncludingExpired(
    centerKey: string
  ): Promise<RecommendationCache | null> {
    const cache = await db.recommendationCaches
      .where('centerKey')
      .equals(centerKey)
      .first();

    if (!cache) {
      return null;
    }

    return this.normalizeCache(cache);
  }

  /**
   * 儲存快取資料
   */
  async set(data: RecommendationCache): Promise<void> {
    // 先刪除相同 centerKey 的舊快取
    await db.recommendationCaches
      .where('centerKey')
      .equals(data.centerKey)
      .delete();

    // 新增快取
    await db.recommendationCaches.add(data);
  }

  /**
   * 刪除特定快取
   */
  async delete(centerKey: string): Promise<void> {
    await db.recommendationCaches
      .where('centerKey')
      .equals(centerKey)
      .delete();
  }

  /**
   * 清除所有過期的快取
   */
  async clearExpired(): Promise<number> {
    const now = new Date();
    const deleted = await db.recommendationCaches
      .where('expiresAt')
      .below(now)
      .delete();
    return deleted;
  }

  /**
   * 清除所有快取
   */
  async clearAll(): Promise<void> {
    await db.recommendationCaches.clear();
  }

  /**
   * 取得所有已快取的搜尋中心點
   */
  async getRecentSearches(limit = 10): Promise<SearchCenter[]> {
    const caches = await db.recommendationCaches
      .orderBy('cachedAt')
      .reverse()
      .limit(limit)
      .toArray();

    return caches.map((cache) => {
      const normalized = this.normalizeCache(cache);
      return normalized.center;
    });
  }

  /**
   * 正規化快取資料（將日期字串轉換為 Date 物件）
   */
  private normalizeCache(cache: RecommendationCache): RecommendationCache {
    return {
      ...cache,
      cachedAt:
        cache.cachedAt instanceof Date
          ? cache.cachedAt
          : new Date(cache.cachedAt),
      expiresAt:
        cache.expiresAt instanceof Date
          ? cache.expiresAt
          : new Date(cache.expiresAt),
      center: {
        ...cache.center,
        searchedAt:
          cache.center.searchedAt instanceof Date
            ? cache.center.searchedAt
            : new Date(cache.center.searchedAt),
      },
    };
  }
}
