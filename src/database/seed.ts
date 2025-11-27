import { isDatabaseInitialized } from './db';
import { tripRepository } from '@/repositories/implementations/DexieTripRepository';
import { dayPlanRepository } from '@/repositories/implementations/DexieDayPlanRepository';
import type { Trip } from '@/types/trip';
import type { DayPlan } from '@/types/day';

// 靜態匯入 JSON 資料
import tripData from '../../data/trips/japan-2026-spring.json';
import day1Data from '../../data/trips/day1.json';
import day2Data from '../../data/trips/day2.json';
import day3Data from '../../data/trips/day3.json';
import day4Data from '../../data/trips/day4.json';
import day5Data from '../../data/trips/day5.json';
import day6Data from '../../data/trips/day6.json';

/**
 * 初始化資料庫
 * 從 JSON 檔案載入旅遊資料到 IndexedDB
 */
export async function seedDatabase(): Promise<void> {
  // 檢查是否已初始化
  const initialized = await isDatabaseInitialized();
  if (initialized) {
    console.log('Database already initialized, skipping seed.');
    return;
  }

  console.log('Seeding database...');

  try {
    // 儲存旅程主檔
    const trip = tripData as Trip;
    await tripRepository.save(trip);

    // 儲存每日行程
    const dayPlans: DayPlan[] = [
      day1Data as DayPlan,
      day2Data as DayPlan,
      day3Data as DayPlan,
      day4Data as DayPlan,
      day5Data as DayPlan,
      day6Data as DayPlan,
    ];

    await dayPlanRepository.saveAll(trip.tripId, dayPlans);

    console.log(`Database seeded successfully: ${dayPlans.length} days loaded.`);
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
}

/**
 * 取得預設旅程 ID
 */
export function getDefaultTripId(): string {
  return 'japan-2026-spring';
}
