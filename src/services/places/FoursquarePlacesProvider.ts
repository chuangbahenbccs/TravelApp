/**
 * Foursquare Places API Provider
 *
 * 實作 IPlacesProvider 介面，使用 Foursquare Places API (新版端點)
 * 遷移指南: https://docs.foursquare.com/fsq-developers-places/reference/migration-guide
 *
 * @module services/places/FoursquarePlacesProvider
 */

import type {
  NearbySearchParams,
  NearbySearchResult,
  PlaceDetails,
  GeocodeParams,
  GeocodeResult,
  PlaceSummary,
  PlaceType,
  PlaceCategory,
  PlacePhoto,
  PriceLevel,
} from '@/types/recommendation';
import {
  type IPlacesProvider,
  NetworkError,
  RateLimitError,
  NotFoundError,
} from './IPlacesProvider';

// Foursquare 類別 ID
const CATEGORY_IDS = {
  restaurant: '13000', // Dining and Drinking
  attraction: '16000', // Landmarks and Outdoors
} as const;

// 新版 Foursquare API 回應型別
interface FoursquarePlace {
  fsq_place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  location: {
    formatted_address?: string;
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
  categories: {
    fsq_category_id: string;
    name: string;
    short_name?: string;
    plural_name?: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }[];
  distance?: number;
  rating?: number;
  price?: number;
  description?: string;
  tel?: string;
  website?: string;
  hours?: {
    display?: string;
    is_local_holiday?: boolean;
    open_now?: boolean;
  };
  photos?: {
    id: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }[];
}

interface FoursquareSearchResponse {
  results: FoursquarePlace[];
  context?: {
    geo_bounds?: unknown;
  };
}

// 請求節流：最小間隔時間（毫秒）
const MIN_REQUEST_INTERVAL = 1000;

/**
 * Foursquare Places Provider
 */
export class FoursquarePlacesProvider implements IPlacesProvider {
  private readonly apiKey: string;
  // 開發環境使用代理，生產環境直連（需要後端代理）
  private readonly baseUrl = import.meta.env.DEV
    ? '/api/foursquare'
    : 'https://places-api.foursquare.com';
  // API 版本日期
  private readonly apiVersion = '2025-06-17';
  // 上次請求時間（用於節流）
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 等待至少 MIN_REQUEST_INTERVAL 毫秒後才發送請求
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * 建立帶有查詢參數的 URL（避免 new URL() 在相對路徑時失敗）
   */
  private buildUrl(path: string, params: Record<string, string>): string {
    const searchParams = new URLSearchParams(params);
    return `${this.baseUrl}${path}?${searchParams.toString()}`;
  }

  /**
   * 搜尋附近地點
   */
  async searchNearby(params: NearbySearchParams): Promise<NearbySearchResult> {
    const queryParams: Record<string, string> = {
      ll: `${params.center.latitude},${params.center.longitude}`,
      radius: String(params.radius ?? 1000),
      limit: String(params.limit ?? 20),
      // 只使用 Core Attributes（免費），避免 Premium 欄位消耗額度
      // Premium 欄位：rating, price, photos, hours, description 等
      fields: 'fsq_place_id,name,latitude,longitude,location,categories,distance',
    };

    // 類別篩選
    if (params.types?.length) {
      const categoryIds = params.types.map((t) => CATEGORY_IDS[t]);
      queryParams.categories = categoryIds.join(',');
    } else {
      queryParams.categories = `${CATEGORY_IDS.restaurant},${CATEGORY_IDS.attraction}`;
    }

    const url = this.buildUrl('/places/search', queryParams);
    const response = await this.fetch(url);
    const data: FoursquareSearchResponse = await response.json();

    return {
      places: data.results.map((place) => this.transformToPlaceSummary(place)),
    };
  }

  /**
   * 取得地點詳細資訊
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const queryParams: Record<string, string> = {
      // 只使用 Core Attributes（免費），避免 Premium 欄位消耗額度
      fields: 'fsq_place_id,name,latitude,longitude,location,categories,distance',
    };

    const url = this.buildUrl(`/places/${placeId}`, queryParams);
    const response = await this.fetch(url);

    if (response.status === 404) {
      throw new NotFoundError(`Place not found: ${placeId}`);
    }

    const place: FoursquarePlace = await response.json();
    return this.transformToPlaceDetails(place);
  }

  /**
   * 將地點名稱轉換為座標（使用 places/search 端點）
   */
  async geocode(params: GeocodeParams): Promise<GeocodeResult | null> {
    const queryParams: Record<string, string> = {
      query: params.query,
      limit: '1',
      fields: 'fsq_place_id,name,latitude,longitude,location',
    };

    if (params.near) {
      queryParams.ll = `${params.near.latitude},${params.near.longitude}`;
    }

    const url = this.buildUrl('/places/search', queryParams);
    const response = await this.fetch(url);
    const data: FoursquareSearchResponse = await response.json();

    const place = data.results[0];
    if (!place) {
      return null;
    }

    return {
      name: place.name,
      address: this.formatAddress(place.location),
      coordinates: {
        latitude: place.latitude,
        longitude: place.longitude,
      },
      placeId: place.fsq_place_id,
    };
  }

  /**
   * 發送 API 請求（帶節流）
   */
  private async fetch(url: string): Promise<Response> {
    // 確保請求間隔至少 1 秒，避免觸發速率限制
    await this.throttle();

    try {
      const response = await fetch(url, {
        headers: {
          // 新版 API 使用 Bearer token 認證
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          // 新版 API 需要版本標頭
          'X-Places-Api-Version': this.apiVersion,
        },
      });

      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '60',
          10
        );
        throw new RateLimitError(
          'Foursquare API rate limit exceeded',
          retryAfter
        );
      }

      if (response.status === 410) {
        throw new NetworkError(
          'Foursquare API 返回 410 Gone。API 端點可能已更新，請檢查最新的遷移指南。'
        );
      }

      if (response.status === 401) {
        throw new NetworkError(
          'Foursquare API 認證失敗 (401)。請確認 Service Key 正確。'
        );
      }

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text().catch(() => '');
        throw new NetworkError(
          `Foursquare API error: ${response.status}${errorText ? ` - ${errorText}` : ''}`
        );
      }

      return response;
    } catch (error) {
      if (
        error instanceof RateLimitError ||
        error instanceof NetworkError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new NetworkError(
        'Failed to connect to Foursquare API',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 轉換為 PlaceSummary
   */
  private transformToPlaceSummary(place: FoursquarePlace): PlaceSummary {
    return {
      id: place.fsq_place_id,
      name: place.name,
      type: this.determineType(place.categories),
      latitude: place.latitude,
      longitude: place.longitude,
      distance: place.distance ?? 0,
      address: this.formatAddress(place.location),
      rating: place.rating,
      priceLevel: place.price as PriceLevel | undefined,
      categories: this.transformCategories(place.categories),
      thumbnailUrl: this.getThumbnailUrl(place.photos),
    };
  }

  /**
   * 轉換為 PlaceDetails
   */
  private transformToPlaceDetails(place: FoursquarePlace): PlaceDetails {
    return {
      ...this.transformToPlaceSummary(place),
      description: place.description,
      photos: this.transformPhotos(place.photos),
      hours: place.hours
        ? {
            display: place.hours.display || '',
            isOpenNow: place.hours.open_now,
          }
        : undefined,
      website: place.website,
      phone: place.tel,
    };
  }

  /**
   * 判斷地點類型
   * 根據類別名稱判斷是否為餐廳
   */
  private determineType(categories: FoursquarePlace['categories']): PlaceType {
    // 餐廳相關關鍵字（根據 Foursquare 類別名稱）
    const restaurantKeywords = [
      'restaurant',
      'cafe',
      'coffee',
      'bakery',
      'bar',
      'pub',
      'food',
      'dining',
      'eatery',
      'bistro',
      'grill',
      'kitchen',
      'diner',
      'ramen',
      'sushi',
      'izakaya',
      'kaiseki',
      'unagi',
      'tempura',
      'udon',
      'soba',
      'yakitori',
      'tonkatsu',
      'curry',
      'noodle',
      'dumpling',
      'dim sum',
      'tea house',
      'dessert',
      'ice cream',
      'pizza',
      'burger',
      'steakhouse',
      'seafood',
      'bbq',
      'brewery',
    ];

    for (const cat of categories) {
      const nameLower = cat.name.toLowerCase();
      if (restaurantKeywords.some((keyword) => nameLower.includes(keyword))) {
        return 'restaurant';
      }
    }
    return 'attraction';
  }

  /**
   * 格式化地址
   */
  private formatAddress(location: FoursquarePlace['location']): string {
    if (location.formatted_address) {
      return location.formatted_address;
    }
    const parts = [location.address, location.locality, location.region].filter(
      Boolean
    );
    return parts.join(', ') || '';
  }

  /**
   * 轉換類別
   */
  private transformCategories(
    categories: FoursquarePlace['categories']
  ): PlaceCategory[] {
    return categories.map((cat) => ({
      id: cat.fsq_category_id,
      name: cat.short_name || cat.name,
      iconUrl: `${cat.icon.prefix}64${cat.icon.suffix}`,
    }));
  }

  /**
   * 取得縮圖 URL
   */
  private getThumbnailUrl(
    photos?: FoursquarePlace['photos']
  ): string | undefined {
    if (!photos || photos.length === 0) {
      return undefined;
    }
    const photo = photos[0];
    if (!photo) {
      return undefined;
    }
    return `${photo.prefix}200x200${photo.suffix}`;
  }

  /**
   * 轉換照片
   */
  private transformPhotos(photos?: FoursquarePlace['photos']): PlacePhoto[] {
    if (!photos) {
      return [];
    }
    return photos.map((photo) => ({
      id: photo.id,
      url: `${photo.prefix}original${photo.suffix}`,
      width: photo.width,
      height: photo.height,
    }));
  }
}

// 單例實例
let providerInstance: FoursquarePlacesProvider | null = null;

/**
 * 取得 Foursquare Provider 單例實例
 *
 * 使用單例模式確保所有地方共用同一個 provider，
 * 這樣節流機制才能正確運作，避免 429 錯誤。
 */
export function createFoursquareProvider(): FoursquarePlacesProvider {
  if (providerInstance) {
    return providerInstance;
  }

  const apiKey = import.meta.env.VITE_FOURSQUARE_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_FOURSQUARE_API_KEY is not defined');
  }

  providerInstance = new FoursquarePlacesProvider(apiKey);
  return providerInstance;
}
