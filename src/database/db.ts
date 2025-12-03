import Dexie, { type Table } from 'dexie';
import type { Trip } from '@/types/trip';
import type { DayPlan } from '@/types/day';
import type { RecommendationCache } from '@/types/recommendation';

/**
 * TravelApp IndexedDB 資料庫
 * 使用 Dexie.js 封裝，遵循資料層抽離原則
 */

// 帶有 tripId 的 DayPlan（用於資料庫儲存）
export interface DayPlanRecord extends DayPlan {
  tripId: string;
}

export class TravelAppDatabase extends Dexie {
  trips!: Table<Trip, string>;
  dayPlans!: Table<DayPlanRecord, [string, number]>;
  recommendationCaches!: Table<RecommendationCache, number>;

  constructor() {
    super('TravelAppDB');

    this.version(1).stores({
      // tripId 作為主鍵
      trips: 'tripId',
      // [tripId, dayNumber] 複合主鍵，tripId 作為索引
      dayPlans: '[tripId+dayNumber], tripId',
    });

    // v2: 新增推薦快取資料表
    this.version(2).stores({
      trips: 'tripId',
      dayPlans: '[tripId+dayNumber], tripId',
      recommendationCaches: '++id, centerKey, cachedAt, expiresAt',
    });
  }
}

// 單例資料庫實例
export const db = new TravelAppDatabase();

/**
 * 檢查資料庫是否已初始化（有資料）
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  const tripCount = await db.trips.count();
  return tripCount > 0;
}

/**
 * 清空資料庫（用於重新初始化）
 */
export async function clearDatabase(): Promise<void> {
  await db.trips.clear();
  await db.dayPlans.clear();
}
