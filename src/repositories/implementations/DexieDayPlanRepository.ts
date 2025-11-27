import { db, type DayPlanRecord } from '@/database/db';
import type { IDayPlanRepository } from '../interfaces/IDayPlanRepository';
import type { DayPlan } from '@/types/day';

/**
 * Dexie (IndexedDB) 每日行程 Repository 實作
 */
export class DexieDayPlanRepository implements IDayPlanRepository {
  async getByDayNumber(tripId: string, dayNumber: number): Promise<DayPlan | undefined> {
    const record = await db.dayPlans.get([tripId, dayNumber]);
    if (!record) return undefined;

    // 移除 tripId，返回純 DayPlan
    const { tripId: _, ...dayPlan } = record;
    return dayPlan as DayPlan;
  }

  async getAllByTripId(tripId: string): Promise<DayPlan[]> {
    const records = await db.dayPlans
      .where('tripId')
      .equals(tripId)
      .sortBy('dayNumber');

    // 移除 tripId，返回純 DayPlan 陣列
    return records.map(({ tripId: _, ...dayPlan }) => dayPlan as DayPlan);
  }

  async save(tripId: string, dayPlan: DayPlan): Promise<void> {
    const record: DayPlanRecord = {
      ...dayPlan,
      tripId,
    };
    await db.dayPlans.put(record);
  }

  async saveAll(tripId: string, dayPlans: DayPlan[]): Promise<void> {
    const records: DayPlanRecord[] = dayPlans.map((dayPlan) => ({
      ...dayPlan,
      tripId,
    }));
    await db.dayPlans.bulkPut(records);
  }

  async delete(tripId: string, dayNumber: number): Promise<void> {
    await db.dayPlans.delete([tripId, dayNumber]);
  }

  async deleteAllByTripId(tripId: string): Promise<void> {
    await db.dayPlans.where('tripId').equals(tripId).delete();
  }
}

// 單例實例
export const dayPlanRepository = new DexieDayPlanRepository();
