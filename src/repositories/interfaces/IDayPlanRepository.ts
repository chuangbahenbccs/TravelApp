import type { DayPlan } from '@/types/day';

/**
 * 每日行程 Repository 介面
 * 遵循資料層抽離原則，所有資料存取必須透過此介面
 */
export interface IDayPlanRepository {
  /**
   * 根據旅程 ID 和天數取得每日行程
   */
  getByDayNumber(tripId: string, dayNumber: number): Promise<DayPlan | undefined>;

  /**
   * 取得旅程的所有每日行程
   */
  getAllByTripId(tripId: string): Promise<DayPlan[]>;

  /**
   * 儲存每日行程
   */
  save(tripId: string, dayPlan: DayPlan): Promise<void>;

  /**
   * 批次儲存多日行程
   */
  saveAll(tripId: string, dayPlans: DayPlan[]): Promise<void>;

  /**
   * 刪除每日行程
   */
  delete(tripId: string, dayNumber: number): Promise<void>;

  /**
   * 刪除旅程的所有每日行程
   */
  deleteAllByTripId(tripId: string): Promise<void>;
}
