import type { DayReference } from './day';

/**
 * 旅客資訊
 */
export interface Traveler {
  role: string;
  age: string;
  notes: string;
  count: number;
}

/**
 * 航班端點資訊
 */
export interface FlightSegment {
  airport: string;
  date: string;
  time: string;
  terminal?: string;
}

/**
 * 航班資訊
 */
export interface FlightInfo {
  flightNo: string;
  departure: FlightSegment;
  arrival: FlightSegment;
}

/**
 * 住宿資訊
 */
export interface Accommodation {
  hotelId: string;
  hotelName: string;
  hotelNameJP: string;
  address: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nearestStation: string;
  features: string[];
  mapUrl: string;
  mealPlan?: string;
  backup?: string[];
}

/**
 * 交通票券
 */
export interface TransportPass {
  passName: string;
  price: { adult: number; child: number };
  currency: string;
  description: string;
}

/**
 * 緊急聯絡資訊
 */
export interface EmergencyContacts {
  police: string;
  ambulance: string;
  taiwanOffice?: {
    name: string;
    phone: string;
  };
}

/**
 * 素食餐廳推薦
 */
export interface VegetarianRestaurant {
  name: string;
  area: string;
  description: string;
}

/**
 * 推薦 App
 */
export interface RecommendedApp {
  name: string;
  description: string;
}

/**
 * 旅程主檔
 */
export interface Trip {
  tripId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  travelers: {
    total: number;
    adults: number;
    children: number;
    details: Traveler[];
  };
  flightInfo: {
    outbound: FlightInfo;
    return: FlightInfo;
  };
  accommodations: Accommodation[];
  transportPasses: TransportPass[];
  emergencyContacts: EmergencyContacts;
  vegetarianRestaurants: VegetarianRestaurant[];
  childcareNotes: string[];
  recommendedApps: RecommendedApp[];
  days: DayReference[];
}
