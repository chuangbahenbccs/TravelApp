import type { Trip } from '@/types/trip';

/**
 * 旅程 Repository 介面
 * 遵循資料層抽離原則，所有資料存取必須透過此介面
 */
export interface ITripRepository {
  /**
   * 根據 ID 取得旅程
   */
  getById(tripId: string): Promise<Trip | undefined>;

  /**
   * 取得所有旅程
   */
  getAll(): Promise<Trip[]>;

  /**
   * 儲存旅程
   */
  save(trip: Trip): Promise<void>;

  /**
   * 刪除旅程
   */
  delete(tripId: string): Promise<void>;

  /**
   * 檢查旅程是否存在
   */
  exists(tripId: string): Promise<boolean>;
}
