/**
 * Google Places API (New) Provider
 *
 * 實作 IPlacesProvider 介面，使用 Google Places API (New) 作為資料來源
 *
 * @module services/places/GooglePlacesProvider
 */

import type {
  NearbySearchParams,
  NearbySearchResult,
  PlaceDetails,
  GeocodeParams,
  GeocodeResult,
  PlaceSummary,
  PlaceType,
} from '@/types/recommendation';

import {
  PlacesProviderError,
  NetworkError,
  RateLimitError,
  NotFoundError,
  type IPlacesProvider,
} from './IPlacesProvider';

/**
 * Google Places API (New) Provider
 */
export class GooglePlacesProvider implements IPlacesProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // 開發環境使用 Vite 代理，生產環境需要後端代理
    this.baseUrl =
      import.meta.env.MODE === 'development'
        ? '/api/google-places/v1'
        : 'https://places.googleapis.com/v1';
  }

  /**
   * 搜尋附近地點
   */
  async searchNearby(params: NearbySearchParams): Promise<NearbySearchResult> {
    // TODO: 實作 searchNearby
    throw new Error('Not implemented yet');
  }

  /**
   * 取得地點詳細資訊
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    // TODO: 實作 getPlaceDetails
    throw new Error('Not implemented yet');
  }

  /**
   * 將地點名稱轉換為座標（Geocoding）
   */
  async geocode(params: GeocodeParams): Promise<GeocodeResult | null> {
    // TODO: 實作 geocode
    throw new Error('Not implemented yet');
  }
}

/**
 * 建立 GooglePlacesProvider 實例
 */
export function createGooglePlacesProvider(): GooglePlacesProvider {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new PlacesProviderError(
      'VITE_GOOGLE_PLACES_API_KEY is not defined in environment variables',
      'API_KEY_MISSING'
    );
  }

  return new GooglePlacesProvider(apiKey);
}
