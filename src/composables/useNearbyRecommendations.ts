/**
 * 附近推薦 Composable
 *
 * 整合 Places Provider 和 Cache Repository，提供推薦功能的狀態管理
 *
 * @module composables/useNearbyRecommendations
 */

import { ref, computed } from 'vue';
import type {
  PlaceSummary,
  PlaceDetails,
  PlaceType,
  SearchCenter,
  RecommendationStatus,
  Coordinates,
} from '@/types/recommendation';
import {
  generateCacheKey,
  createCachedRecommendation,
  formatCacheAge,
} from '@/types/recommendation';
import { createFoursquareProvider } from '@/services/places/FoursquarePlacesProvider';
import { DexieRecommendationCacheRepository } from '@/repositories/implementations/DexieRecommendationCacheRepository';
import { NetworkError } from '@/services/places/IPlacesProvider';

// 單例 Provider 和 Repository
const provider = createFoursquareProvider();
const cacheRepo = new DexieRecommendationCacheRepository();

// 預設搜尋半徑（公尺）
const DEFAULT_RADIUS = 1000;

/**
 * 附近推薦 Composable
 */
export function useNearbyRecommendations() {
  // 狀態
  const status = ref<RecommendationStatus>('idle');
  const places = ref<PlaceSummary[]>([]);
  const center = ref<SearchCenter | null>(null);
  const activeFilter = ref<PlaceType | 'all'>('all');
  const error = ref<string | null>(null);
  const isFromCache = ref(false);
  const cacheAge = ref<string | null>(null);
  const selectedPlace = ref<PlaceDetails | null>(null);
  const isLoadingDetails = ref(false);

  // 計算屬性
  const filteredPlaces = computed(() => {
    if (activeFilter.value === 'all') {
      return places.value;
    }
    return places.value.filter((p) => p.type === activeFilter.value);
  });

  const isLoading = computed(() => status.value === 'loading');
  const isOffline = computed(() => status.value === 'offline');
  const hasError = computed(() => status.value === 'error');
  const isEmpty = computed(
    () => status.value === 'success' && places.value.length === 0
  );

  /**
   * 搜尋附近推薦
   */
  async function searchNearby(
    coordinates: Coordinates,
    locationName: string = ''
  ) {
    const radius = DEFAULT_RADIUS;
    const cacheKey = generateCacheKey(coordinates, radius);

    status.value = 'loading';
    error.value = null;
    isFromCache.value = false;
    cacheAge.value = null;

    try {
      // 檢查快取
      const cached = await cacheRepo.get(cacheKey);
      if (cached) {
        places.value = cached.places;
        center.value = cached.center;
        isFromCache.value = true;
        cacheAge.value = formatCacheAge(cached);
        status.value = 'success';
        return;
      }

      // 檢查網路狀態
      if (!navigator.onLine) {
        // 離線時嘗試使用過期快取
        const expiredCache = await cacheRepo.getIncludingExpired(cacheKey);
        if (expiredCache) {
          places.value = expiredCache.places;
          center.value = expiredCache.center;
          isFromCache.value = true;
          cacheAge.value = formatCacheAge(expiredCache);
          status.value = 'offline';
          return;
        }
        throw new Error('需要網路連線');
      }

      // 呼叫 API
      const result = await provider.searchNearby({
        center: coordinates,
        radius,
      });

      // 建立搜尋中心點
      const searchCenter: SearchCenter = {
        name: locationName,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius,
        searchedAt: new Date(),
      };

      places.value = result.places;
      center.value = searchCenter;
      status.value = 'success';

      // 儲存快取
      const cacheData = createCachedRecommendation(searchCenter, result.places);
      await cacheRepo.set(cacheData);
    } catch (e) {
      // 錯誤時嘗試使用過期快取
      const expiredCache = await cacheRepo.getIncludingExpired(cacheKey);
      if (expiredCache) {
        places.value = expiredCache.places;
        center.value = expiredCache.center;
        isFromCache.value = true;
        cacheAge.value = formatCacheAge(expiredCache);
        status.value = 'offline';
        return;
      }

      if (e instanceof NetworkError) {
        error.value = '網路連線失敗，請稍後再試';
      } else if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = '載入失敗，請稍後再試';
      }
      status.value = 'error';
    }
  }

  /**
   * 重新整理推薦
   */
  async function refresh() {
    if (!center.value) return;

    const coordinates: Coordinates = {
      latitude: center.value.latitude,
      longitude: center.value.longitude,
    };

    // 清除該位置的快取
    const cacheKey = generateCacheKey(coordinates, center.value.radius);
    await cacheRepo.delete(cacheKey);

    // 重新搜尋
    await searchNearby(coordinates, center.value.name);
  }

  /**
   * 設定篩選類別
   */
  function setFilter(filter: PlaceType | 'all') {
    activeFilter.value = filter;
  }

  /**
   * 取得地點詳情
   */
  async function getPlaceDetails(placeId: string) {
    isLoadingDetails.value = true;
    selectedPlace.value = null;

    try {
      const details = await provider.getPlaceDetails(placeId);
      selectedPlace.value = details;
    } catch (e) {
      // 如果無法取得詳情，使用清單中的基本資訊
      const place = places.value.find((p) => p.id === placeId);
      if (place) {
        selectedPlace.value = {
          ...place,
          photos: [],
        };
      }
    } finally {
      isLoadingDetails.value = false;
    }
  }

  /**
   * 清除選取的地點
   */
  function clearSelectedPlace() {
    selectedPlace.value = null;
  }

  /**
   * 取得最近搜尋
   */
  async function getRecentSearches(limit = 10): Promise<SearchCenter[]> {
    return cacheRepo.getRecentSearches(limit);
  }

  /**
   * 清除所有快取
   */
  async function clearAllCache() {
    await cacheRepo.clearAll();
  }

  return {
    // 狀態
    status,
    places,
    filteredPlaces,
    center,
    activeFilter,
    error,
    isFromCache,
    cacheAge,
    selectedPlace,
    isLoadingDetails,

    // 計算屬性
    isLoading,
    isOffline,
    hasError,
    isEmpty,

    // 方法
    searchNearby,
    refresh,
    setFilter,
    getPlaceDetails,
    clearSelectedPlace,
    getRecentSearches,
    clearAllCache,
  };
}
