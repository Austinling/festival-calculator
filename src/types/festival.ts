// Festival Base Configuration
export interface Festival {
  id: string;
  name: string;
  capacity: number;
  budget: number;
  dates: { start: string; end: string };
  location: string;
  durationDays: number;
}

// Stages
export interface Stage {
  id: string;
  name: string;
  capacity: number;
  type: "main" | "secondary" | "workshop" | "vip";
  powerConsumption: number; // kW
  setupCost: number;
}

// Lineup
export interface Artist {
  id: string;
  name: string;
  stageId: string;
  genre: string;
  duration: number; // in minutes
  startTime: string; // HH:mm
  ticketRevenue: number; // additional per ticket if headliner
  drawFactor: number; // 0.5 - 2.0 multiplier on attendance
}

// Vendors
export interface Vendor {
  id: string;
  name: string;
  category: "food" | "merchandise" | "sponsor";
  capacity: number; // people/day
  commissionRate: number; // 0-1
  estimatedDailyRevenue: number;
}

// Infrastructure
export interface Toilet {
  id: string;
  quantity: number;
  type: "standard" | "accessible" | "luxury";
  maintenanceCostPerDay: number;
}

export interface SecurityStaff {
  id: string;
  quantity: number;
  role: "perimeter" | "crowd-control" | "medical";
  costPerDay: number;
}

export interface Amenity {
  id: string;
  name: string;
  type: "parking" | "camping" | "medical" | "lost-found" | "wifi" | "charging";
  setupCost: number;
  maintenanceCostPerDay: number;
}

// Complete Festival Config
export interface FestivalConfig {
  festival: Festival;
  stages: Stage[];
  artists: Artist[];
  vendors: Vendor[];
  toilets: Toilet[];
  security: SecurityStaff[];
  amenities: Amenity[];
}

// Simulation Weather & Conditions
export type WeatherCondition = "sunny" | "rainy" | "cloudy" | "extreme";

export interface SimulationModifiers {
  weather: WeatherCondition;
  marketingBudget: number; // percentage 0-100
  eventReputation: number; // 0-100
}

// Simulation Results - Detailed breakdown
export interface SimulationMetrics {
  // Attendance
  projectedAttendance: number;
  peakDayAttendance: number;
  attendanceByDay: number[];

  // Crowd Experience
  toiletWaitTimeMinutes: number;
  crowdSatisfaction: number; // 0-100
  safetyRating: number; // 0-100
  securityIncidents: number;

  // Financials
  totalRevenue: number;
  ticketRevenue: number;
  vendorCommission: number;
  totalOPEX: number;
  totalCAPEX: number;
  netProfit: number;
  breakEvenPoint: number; // day number

  // Operations
  energyUsage: number; // kWh
  wasteGenerated: number; // tonnes
  staffRequiredPerDay: number;

  // Grade
  grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
  verdict: string;
}

export interface SimulationResult {
  id: string;
  festivalId: string;
  config: FestivalConfig;
  modifiers: SimulationModifiers;
  metrics: SimulationMetrics;
  timestamp: string;
}
