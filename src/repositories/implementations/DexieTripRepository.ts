import { db } from '@/database/db';
import type { ITripRepository } from '../interfaces/ITripRepository';
import type { Trip } from '@/types/trip';

/**
 * Dexie (IndexedDB) 旅程 Repository 實作
 */
export class DexieTripRepository implements ITripRepository {
  async getById(tripId: string): Promise<Trip | undefined> {
    return db.trips.get(tripId);
  }

  async getAll(): Promise<Trip[]> {
    return db.trips.toArray();
  }

  async save(trip: Trip): Promise<void> {
    await db.trips.put(trip);
  }

  async delete(tripId: string): Promise<void> {
    await db.trips.delete(tripId);
  }

  async exists(tripId: string): Promise<boolean> {
    const trip = await db.trips.get(tripId);
    return trip !== undefined;
  }
}

// 單例實例
export const tripRepository = new DexieTripRepository();
