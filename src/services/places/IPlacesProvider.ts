/**
 * Places Provider 介面
 *
 * 定義地點資料提供者的抽象介面，支援未來切換資料來源
 *
 * @module services/places/IPlacesProvider
 */

import type {
  NearbySearchParams,
  NearbySearchResult,
  PlaceDetails,
  GeocodeParams,
  GeocodeResult,
} from '@/types/recommendation';

/**
 * 地點資料提供者介面
 */
export interface IPlacesProvider {
  /**
   * 搜尋附近地點
   */
  searchNearby(params: NearbySearchParams): Promise<NearbySearchResult>;

  /**
   * 取得地點詳細資訊
   */
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;

  /**
   * 將地點名稱轉換為座標
   */
  geocode(params: GeocodeParams): Promise<GeocodeResult | null>;
}

/**
 * 基礎 Provider 錯誤
 */
export class PlacesProviderError extends Error {
  readonly code: string;
  readonly originalCause?: Error;

  constructor(message: string, code: string, cause?: Error) {
    super(message);
    this.name = 'PlacesProviderError';
    this.code = code;
    this.originalCause = cause;
  }
}

/**
 * 網路錯誤
 */
export class NetworkError extends PlacesProviderError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

/**
 * API 速率限制錯誤
 */
export class RateLimitError extends PlacesProviderError {
  readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, cause?: Error) {
    super(message, 'RATE_LIMIT_ERROR', cause);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * 地點不存在錯誤
 */
export class NotFoundError extends PlacesProviderError {
  constructor(message: string, cause?: Error) {
    super(message, 'NOT_FOUND_ERROR', cause);
    this.name = 'NotFoundError';
  }
}
