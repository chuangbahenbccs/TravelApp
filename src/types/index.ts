// 基礎型別定義

/**
 * 位置資訊
 */
export interface Location {
  name: string;
  address: string;
}

/**
 * 備用選項（餐廳備案）
 */
export interface BackupOption {
  name: string;
  description: string;
  mapUrl?: string;
}

/**
 * 卡片類型
 */
export type CardType = 'activity' | 'restaurant' | 'transport';

// 匯出所有型別
export * from './card';
export * from './day';
export * from './trip';
