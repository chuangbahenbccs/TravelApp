import type { Card } from './card';

/**
 * 路線摘要
 */
export interface RouteSummary {
  description: string;
  mapUrl?: string;
}

/**
 * 每日行程
 */
export interface DayPlan {
  dayNumber: number;
  date: string;           // YYYY-MM-DD 格式
  dayOfWeek: string;      // 週五、週六...
  theme: string;          // 當日主題
  location: string;       // 主要地點
  accommodation: string | null;  // 飯店 ID 參照（可為 null）
  passUsed?: string;      // 使用的交通票券
  cards: Card[];          // 當日所有行程卡片
  routeSummary?: RouteSummary;
  importantNotes?: string[]; // 重要注意事項
}

/**
 * 每日行程參照（用於主旅程檔案）
 */
export interface DayReference {
  dayNumber: number;
  date: string;
  file: string;
}
