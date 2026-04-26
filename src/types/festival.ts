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
  type: "main" | "secondary" | "small";
  powerConsumption: number; // kW
  setupCost: number;
  tierId?: "small" | "medium" | "large"; // Optional tier reference
}

// Lineup
export interface Artist {
  id: string;
  name: string;
  stageId: string;
  performanceDay?: number; // 1-based festival day assignment
  genre: string;
  duration: number; // in minutes (fixed at 45 per set)
  startTime: string; // auto-assigned HH:mm
  setCost: number; // cost per 45-min set
  ticketRevenue: number; // additional per ticket if headliner
  drawFactor: number; // 0.5 - 2.0 multiplier on attendance
}

// Vendors
export interface Vendor {
  id: string;
  name: string;
  category: "food" | "merchandise";
  capacity: number; // people/day
  commissionRate: number; // 0-1
  estimatedDailyRevenue: number;
}

export interface SponsorDeal {
  id: string;
  name: string;
  tier: "community" | "regional" | "headline";
  profit: number; // direct profit contribution for the full event
}

// Infrastructure
export interface Toilet {
  id: string;
  quantity: number;
  type: "standard" | "disabled";
  maintenanceCostPerWeek: number;
}

export interface SecurityStaff {
  id: string;
  quantity: number;
  role: "general-officer" | "door-supervisor" | "traffic-management";
  costPerHour: number;
  hoursPerDay: number;
}

export interface MedicalStaffResource {
  id: string;
  quantity: number;
  role: "paramedic" | "nurse" | "first-responder" | "ambulance-4x4" | "gazebo";
  costPerHour: number;
  hoursPerDay: number;
  mileagePerDay?: number;
  mileageRatePerMile?: number;
}

export interface Amenity {
  id: string;
  name: string;
  type: "parking" | "wifi";
  setupCost: number;
  maintenanceCostPerDay: number;
}

// Complete Festival Config
export interface FestivalConfig {
  festival: Festival;
  stages: Stage[];
  artists: Artist[];
  vendors: Vendor[];
  sponsors: SponsorDeal[];
  toilets: Toilet[];
  security: SecurityStaff[];
  medicalStaff: MedicalStaffResource[];
  amenities: Amenity[];
}

// Simulation Weather & Conditions
export type WeatherCondition = "sunny" | "rainy" | "cloudy" | "extreme";

export interface SimulationModifiers {
  weatherByDay: WeatherCondition[]; // one forecast per festival day
  marketingBudget: number; // direct spend in dollars
  eventReputation: number; // 0-100
  ticketPrice: number[]; // one value per festival day
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
  sponsorshipRevenue: number;
  electricityCost: number;
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
