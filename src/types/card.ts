import type { Location, BackupOption, CardType } from './index';

/**
 * 活動卡片詳細資訊
 */
export interface ActivityDetails {
  tasks?: string[];
  hours?: string;
  admission?: Record<string, string>;
  mustSee?: string[];
  childFriendly?: string[];
  tip?: string;
  note?: string;
  walkFrom?: string;
  walkDuration?: string;
  features?: string[];
}

/**
 * 餐廳卡片詳細資訊
 */
export interface RestaurantDetails {
  cuisine: string;
  priceRange: string;
  vegetarianOption?: string;
  businessHours?: string;
  reservation?: string;
  mustOrder?: string[];
  feature?: string;
  history?: string;
  mealType?: string;
}

/**
 * 交通卡片詳細資訊
 */
export interface TransportDetails {
  transportation: string;
  duration: string;
  fare?: string;
  route?: string;
  feature?: string;
  flightNo?: string;
  note?: string;
}

/**
 * 基礎卡片介面
 */
export interface BaseCardData {
  cardId: string;
  cardType: CardType;
  time: string;
  endTime: string;
  title: string;
  subtitle: string;
  location: Location;
  navigationUrl?: string;
  tags?: string[];
  routeDescription?: string;
}

/**
 * 活動卡片
 */
export interface ActivityCard extends BaseCardData {
  cardType: 'activity';
  details: ActivityDetails;
}

/**
 * 餐廳卡片
 */
export interface RestaurantCard extends BaseCardData {
  cardType: 'restaurant';
  details: RestaurantDetails;
  backup?: BackupOption[];
}

/**
 * 交通卡片
 */
export interface TransportCard extends BaseCardData {
  cardType: 'transport';
  details: TransportDetails;
}

/**
 * 聯合卡片型別
 */
export type Card = ActivityCard | RestaurantCard | TransportCard;

/**
 * 型別守衛：判斷是否為活動卡片
 */
export function isActivityCard(card: Card): card is ActivityCard {
  return card.cardType === 'activity';
}

/**
 * 型別守衛：判斷是否為餐廳卡片
 */
export function isRestaurantCard(card: Card): card is RestaurantCard {
  return card.cardType === 'restaurant';
}

/**
 * 型別守衛：判斷是否為交通卡片
 */
export function isTransportCard(card: Card): card is TransportCard {
  return card.cardType === 'transport';
}
