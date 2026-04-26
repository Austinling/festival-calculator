import type {
  FestivalConfig,
  SimulationModifiers,
  SimulationMetrics,
  WeatherCondition,
} from "../types/festival";
import type { ExperienceLevel } from "./AuthTypes";
import { calculateElectricityStats } from "./StageTiers";

type EventSizeTier = "small" | "medium" | "large";

const WIFI_COST_BY_EVENT_SIZE: Record<EventSizeTier, number> = {
  small: 2500,
  medium: 10000,
  large: 100000,
};

const PARKING_FIXED_COST_BY_EVENT_SIZE: Record<EventSizeTier, number> = {
  small: 500,
  medium: 4500,
  large: 40000,
};

const PARKING_VARIABLE_COST_PER_DAY_BY_EVENT_SIZE: Record<
  EventSizeTier,
  number
> = {
  small: 120,
  medium: 1600,
  large: 11000,
};

const MEDICAL_ZONE_FLAT_COST = 15000;
const OPEX_REDUCTION_BY_EXPERIENCE: Record<ExperienceLevel, number> = {
  beginner: 0,
  intermediate: 0.05,
  experienced: 0.15,
};
const ADVERSE_WEATHER_VENDOR_REVENUE_MULTIPLIER = 0.6;
const ADVERSE_WEATHER_WASTE_CLEANUP_MULTIPLIER = 2;
const WASTE_CLEANUP_COST_PER_ATTENDEE = 2;
const STAFF_FATIGUE_THRESHOLD_DAYS = 5;
const STAFF_FATIGUE_PREMIUM_MULTIPLIER = 1.2;
const ELECTRICITY_BASE_LOAD_MULTIPLIER = 0.05;

function getEventSizeTier(stageCount: number): EventSizeTier {
  if (stageCount > 5) return "large";
  if (stageCount >= 3) return "medium";
  return "small";
}

// Weather Impact Multipliers
const WEATHER_IMPACT = {
  sunny: { attendance: 1.0, cleanupCost: 1.0 },
  cloudy: { attendance: 0.95, cleanupCost: 1.0 },
  rainy: { attendance: 0.75, cleanupCost: 1.5 },
  extreme: { attendance: 0.5, cleanupCost: 2.0 },
} as const;

function isAdverseWeather(weather: WeatherCondition): boolean {
  return weather === "rainy" || weather === "extreme";
}

// Calculate base attendance from festival capacity and marketing
function calculateAttendance(
  config: FestivalConfig,
  modifiers: SimulationModifiers,
): { projectedAttendance: number; attendanceByDay: number[] } {
  const capacity = config.festival.capacity;
  const daysOfEvent = Math.max(config.festival.durationDays, 1);
  const reputationMultiplier = 0.7 + (modifiers.eventReputation / 100) * 0.3; // 70%-100%
  const baselinePricePerDay = 60;
  const marketingCapBoost = Math.min(
    (Math.max(modifiers.marketingBudget, 0) / 10000) * 0.1,
    1,
  );
  const attendanceCap = Math.floor(capacity * (1 + marketingCapBoost));

  const ticketPriceByDay = Array.from({ length: daysOfEvent }, (_, index) => {
    const providedPrice = modifiers.ticketPrice[index];
    return typeof providedPrice === "number" && providedPrice > 0
      ? providedPrice
      : baselinePricePerDay;
  });

  const weatherByDay = Array.from({ length: daysOfEvent }, (_, index) => {
    const weather = modifiers.weatherByDay[index];
    return weather ?? "sunny";
  });

  const attendanceByDay = Array.from({ length: daysOfEvent }, (_, index) => {
    const performanceDay = index + 1;
    const artistsForDay = config.artists.filter(
      (artist) => (artist.performanceDay ?? 1) === performanceDay,
    );

    if (artistsForDay.length === 0) return 0;

    const topDraw = Math.max(...artistsForDay.map((a) => a.drawFactor), 0);
    const artistDrawMultiplier = topDraw;

    const currentPricePerDay = ticketPriceByDay[index];
    const weatherMultiplier = WEATHER_IMPACT[weatherByDay[index]].attendance;
    const priceMultiplier = Math.max(
      0.2,
      Math.min(1.5, Math.pow(baselinePricePerDay / currentPricePerDay, 1.1)),
    );

    const projected = Math.floor(
      attendanceCap *
        reputationMultiplier *
        weatherMultiplier *
        artistDrawMultiplier *
        priceMultiplier,
    );

    return Math.min(projected, attendanceCap);
  });

  const projectedAttendance = Math.floor(
    attendanceByDay.reduce((sum, dayAttendance) => sum + dayAttendance, 0) /
      Math.max(1, daysOfEvent),
  );

  return {
    projectedAttendance,
    attendanceByDay,
  };
}

// Calculate toilet wait times
function calculateToiletWaitTime(
  attendance: number,
  toiletQuantity: number,
): number {
  const peoplePerToilet = attendance / Math.max(toiletQuantity, 1);
  // Every 100 people per toilet = ~5 min wait
  return Math.ceil((peoplePerToilet / 100) * 5);
}

// Calculate crowd satisfaction (0-100)
function calculateCrowdSatisfaction(
  toiletWaitTime: number,
  securityStaffRatio: number,
  vendorCapacityMet: boolean,
  crowdingPenaltyPoints: number,
): number {
  let score = 100;
  score -= Math.min(toiletWaitTime * 2, 30); // Max -30 for wait times
  score -= Math.min((100 - securityStaffRatio * 100) * 0.3, 20); // Max -20 for security
  if (!vendorCapacityMet) score -= 15; // -15 if vendors can't handle crowd
  score -= crowdingPenaltyPoints;
  return Math.max(score, 20);
}

// Calculate security incidents based on crowd satisfaction and staff
function calculateSecurityIncidents(
  satisfaction: number,
  staffRatio: number,
): number {
  const baseIncidents = 10 - satisfaction / 10; // 10 to 0 based on satisfaction
  const staffImpact = (1 - staffRatio) * 5; // up to +5 if understaffed
  return Math.max(Math.round(baseIncidents + staffImpact), 0);
}

// Calculate safety rating (0-100)
function calculateSafetyRating(
  incidents: number,
  staffRatio: number,
  amenitiesCount: number,
  crowdingPenaltyPoints: number,
): number {
  let score = 100;
  score -= incidents * 3;
  score += staffRatio * 15; // Good staff ratio helps
  score += Math.min(amenitiesCount * 5, 20); // Medical, parking, etc.
  score -= crowdingPenaltyPoints;
  return Math.max(Math.min(score, 100), 20);
}

// Calculate revenue
function calculateRevenue(
  attendanceByDay: number[],
  ticketPriceByDay: number[],
  weatherByDay: WeatherCondition[],
  config: FestivalConfig,
): {
  ticketRevenue: number;
  vendorRevenue: number;
  sponsorshipRevenue: number;
} {
  const ticketRevenue = attendanceByDay.reduce(
    (sum, dayAttendance, index) =>
      sum +
      dayAttendance * (ticketPriceByDay[index] ?? ticketPriceByDay[0] ?? 0),
    0,
  );

  const vendorRevenue = attendanceByDay.reduce((sum, dayAttendance, index) => {
    const weather = weatherByDay[index] ?? "sunny";
    const weatherRevenueMultiplier = isAdverseWeather(weather)
      ? ADVERSE_WEATHER_VENDOR_REVENUE_MULTIPLIER
      : 1;

    const dayVendorRevenue = config.vendors.reduce((daySum, vendor) => {
      const vendorAttendance = Math.min(dayAttendance, vendor.capacity);
      const revenue = vendorAttendance * 25; // Avg $25 per person at vendor
      return (
        daySum + revenue * vendor.commissionRate * weatherRevenueMultiplier
      );
    }, 0);

    return sum + dayVendorRevenue;
  }, 0);

  const sponsorshipRevenue = config.sponsors.reduce(
    (sum, sponsor) => sum + sponsor.profit,
    0,
  );

  return { ticketRevenue, vendorRevenue, sponsorshipRevenue };
}

// Calculate OPEX (Operating Expenses)
function calculateOPEX(
  config: FestivalConfig,
  attendanceByDay: number[],
  weatherByDay: WeatherCondition[],
  daysOfEvent: number,
  experienceLevel: ExperienceLevel,
  marketingBudget: number,
): { totalOpex: number; electricityCost: number } {
  let opex = 0;
  let electricityCostTotal = 0;
  let totalKWhUsed = 0;

  const eventSizeTier = getEventSizeTier(config.stages.length);
  const fatigueMultiplier =
    daysOfEvent > STAFF_FATIGUE_THRESHOLD_DAYS
      ? STAFF_FATIGUE_PREMIUM_MULTIPLIER
      : 1;
  const nonDiscountedMarketingCost = Math.max(marketingBudget, 0);

  // Staff costs
  config.security.forEach((staff) => {
    opex +=
      staff.quantity *
      staff.costPerHour *
      staff.hoursPerDay *
      daysOfEvent *
      fatigueMultiplier;
  });

  // Medical staff and resources
  config.medicalStaff.forEach((staff) => {
    opex +=
      staff.quantity *
      staff.costPerHour *
      staff.hoursPerDay *
      daysOfEvent *
      fatigueMultiplier;
    if (staff.role === "ambulance-4x4") {
      opex +=
        staff.quantity *
        (staff.mileagePerDay ?? 0) *
        (staff.mileageRatePerMile ?? 0.4) *
        daysOfEvent;
    }
  });

  // Artist booking costs (one cost per fixed 45-minute set)
  config.artists.forEach((artist) => {
    opex += artist.setCost;
  });

  // Toilet maintenance
  config.toilets.forEach((toilet) => {
    const baseCost = toilet.quantity * (toilet.maintenanceCostPerWeek / 7);
    weatherByDay.forEach((weather) => {
      const cleanupMultiplier = WEATHER_IMPACT[weather].cleanupCost;
      opex += baseCost * cleanupMultiplier;
    });
  });

  // Amenity maintenance
  config.amenities.forEach((amenity) => {
    if (amenity.type === "parking") {
      opex +=
        PARKING_VARIABLE_COST_PER_DAY_BY_EVENT_SIZE[eventSizeTier] *
        daysOfEvent;
      return;
    }

    if (amenity.type === "wifi") {
      opex += WIFI_COST_BY_EVENT_SIZE[eventSizeTier];
      return;
    }

    opex += amenity.maintenanceCostPerDay * daysOfEvent;
  });

  // Electricity costs for stages (24 hours per day at £0.2467/kWh)
  const hoursPerDay = 24;
  config.stages.forEach((stage) => {
    const { cost, kWh } = calculateElectricityStats(
      stage.powerConsumption,
      daysOfEvent,
    );

    totalKWhUsed += kWh;
    electricityCostTotal += cost;
    opex += cost;
  });

  const wasteCleanupCost = attendanceByDay.reduce(
    (sum, dayAttendance, index) => {
      const weather = weatherByDay[index] ?? "sunny";
      const weatherWasteMultiplier = isAdverseWeather(weather)
        ? ADVERSE_WEATHER_WASTE_CLEANUP_MULTIPLIER
        : 1;

      return (
        sum +
        dayAttendance * WASTE_CLEANUP_COST_PER_ATTENDEE * weatherWasteMultiplier
      );
    },
    0,
  );
  opex += wasteCleanupCost;

  // Event logistics only when there is actual infrastructure to support
  const hasOperationalCosts =
    config.security.length > 0 ||
    config.medicalStaff.length > 0 ||
    config.toilets.length > 0 ||
    config.amenities.length > 0 ||
    config.vendors.length > 0;

  if (hasOperationalCosts) {
    const averageAttendance =
      attendanceByDay.reduce((sum, dayAttendance) => sum + dayAttendance, 0) /
      Math.max(1, daysOfEvent);
    opex += Math.ceil(averageAttendance / 1000) * 250 * daysOfEvent;
  }

  const reductionMultiplier =
    1 - (OPEX_REDUCTION_BY_EXPERIENCE[experienceLevel] ?? 0);

  return {
    totalOpex: Math.round(
      opex * reductionMultiplier + nonDiscountedMarketingCost,
    ),
    electricityCost: Math.round(electricityCostTotal * reductionMultiplier),
    totalKWh: Math.round(totalKWhUsed),
  };
}

// Calculate CAPEX (Capital Expenses)
function calculateCAPEX(config: FestivalConfig): number {
  let capex = 0;
  const eventSizeTier = getEventSizeTier(config.stages.length);

  config.stages.forEach((stage) => {
    capex += stage.setupCost;
  });

  config.amenities.forEach((amenity) => {
    if (amenity.type === "parking") {
      capex += PARKING_FIXED_COST_BY_EVENT_SIZE[eventSizeTier];
      return;
    }

    capex += amenity.setupCost;
  });

  if (config.medicalStaff.length > 0) {
    capex += MEDICAL_ZONE_FLAT_COST;
  }

  // Infrastructure costs (toilets, etc)
  config.toilets.forEach((toilet) => {
    capex += toilet.quantity * 2000; // $2k per toilet unit
  });

  return Math.round(capex);
}

// Assign grade based on profit margin and satisfaction
function assignGrade(
  netProfit: number,
  satisfaction: number,
  safetyRating: number,
): "A+" | "A" | "B+" | "B" | "C" | "D" | "F" {
  const profitScore = Math.max(
    0,
    Math.min(netProfit > 100000 ? 30 : netProfit > 0 ? 20 : 10, 30),
  );
  const satisfactionScore = (satisfaction / 100) * 35;
  const safetyScore = (safetyRating / 100) * 35;
  const total = profitScore + satisfactionScore + safetyScore;

  if (total >= 90) return "A+";
  if (total >= 85) return "A";
  if (total >= 75) return "B+";
  if (total >= 65) return "B";
  if (total >= 50) return "C";
  if (total >= 35) return "D";
  return "F";
}

export function simulateFestival(
  config: FestivalConfig,
  modifiers: SimulationModifiers,
  experienceLevel: ExperienceLevel = "beginner",
): SimulationMetrics {
  const daysOfEvent = Math.max(config.festival.durationDays, 1);
  const ticketPriceByDay = Array.from({ length: daysOfEvent }, (_, index) => {
    const price = modifiers.ticketPrice[index];
    return typeof price === "number" && price > 0 ? price : 60;
  });
  const weatherByDay = Array.from({ length: daysOfEvent }, (_, index) => {
    const weather = modifiers.weatherByDay[index];
    return (weather ?? "sunny") as WeatherCondition;
  });

  // Step 1: Calculate Attendance
  const { projectedAttendance: attendance, attendanceByDay } =
    calculateAttendance(config, modifiers);
  const peakDayAttendance = Math.max(...attendanceByDay, 0);
  const totalStageCapacity = config.stages.reduce(
    (sum, stage) => sum + stage.capacity,
    0,
  );
  const overCapacityRatio = peakDayAttendance / Math.max(1, totalStageCapacity);
  const crowdingPenaltyPoints =
    overCapacityRatio > 1.0
      ? Math.min(50, Math.ceil((overCapacityRatio - 1.0) * 100)) // More aggressive penalty
      : 0;

  // Step 2: Crowd Experience
  const totalToilets = config.toilets.reduce((sum, t) => sum + t.quantity, 0);
  const toiletWaitTime = calculateToiletWaitTime(attendance, totalToilets);

  const totalStaff = config.security.reduce((sum, s) => sum + s.quantity, 0);
  const staffRatio = Math.min(totalStaff / Math.max(attendance / 100, 1), 1);

  const vendorCapacityMet =
    config.vendors.reduce((sum, v) => sum + v.capacity, 0) >= attendance;

  const crowdSatisfaction = calculateCrowdSatisfaction(
    toiletWaitTime,
    staffRatio,
    vendorCapacityMet,
    crowdingPenaltyPoints,
  );

  const securityIncidents = calculateSecurityIncidents(
    crowdSatisfaction,
    staffRatio,
  );

  const safetyRating = calculateSafetyRating(
    securityIncidents,
    staffRatio,
    config.amenities.length,
    crowdingPenaltyPoints,
  );

  // Step 3: Financials
  const { ticketRevenue, vendorRevenue, sponsorshipRevenue } = calculateRevenue(
    attendanceByDay,
    ticketPriceByDay,
    weatherByDay,
    config,
  );
  const totalRevenue = ticketRevenue + vendorRevenue + sponsorshipRevenue;

  const {
    totalOpex,
    electricityCost,
    totalKWh: energyUsageResult,
  } = calculateOPEX(
    config,
    attendanceByDay,
    weatherByDay,
    daysOfEvent,
    experienceLevel,
    modifiers.marketingBudget,
  );

  const capex = calculateCAPEX(config);

  const netProfit = totalRevenue - totalOpex - capex;
  const breakEvenDay = Math.ceil(
    capex / Math.max(totalRevenue / Math.max(1, daysOfEvent), 1),
  );

  // Energy usage
  const energyUsage = config.stages.reduce((sum, stage) => {
    const showHours = 12; // Stages aren't full blast 24/7
    const standbyHours = 12;
    const dailyKwh =
      stage.powerConsumption * showHours +
      stage.powerConsumption * 0.1 * standbyHours;
    return sum + dailyKwh * daysOfEvent;
  }, 0);

  // Waste
  const wasteGenerated = (attendance * 2) / 1000; // 2kg per person -> tonnes

  const staffRequired = Math.ceil(totalStaff / Math.max(1, daysOfEvent));

  const grade = assignGrade(netProfit, crowdSatisfaction, safetyRating);
  const verdict =
    grade === "A+" || grade === "A"
      ? "Outstanding festival! People will remember this."
      : grade === "B+" || grade === "B"
        ? "Solid festival with good experiences."
        : grade === "C"
          ? "Adequate festival, but could improve significantly."
          : "Festival struggles to meet expectations.";

  return {
    projectedAttendance: attendance,
    peakDayAttendance,
    attendanceByDay,
    toiletWaitTimeMinutes: toiletWaitTime,
    crowdSatisfaction,
    safetyRating,
    securityIncidents,
    totalRevenue: Math.round(totalRevenue),
    ticketRevenue: Math.round(ticketRevenue),
    vendorCommission: Math.round(vendorRevenue),
    sponsorshipRevenue: Math.round(sponsorshipRevenue),
    electricityCost,
    totalOPEX: totalOpex,
    totalCAPEX: capex,
    netProfit: Math.round(netProfit),
    breakEvenPoint: breakEvenDay,
    energyUsage: energyUsageResult,
    wasteGenerated: Math.round(wasteGenerated * 100) / 100,
    staffRequiredPerDay: staffRequired,
    grade,
    verdict,
  };
}
