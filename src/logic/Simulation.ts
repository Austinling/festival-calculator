import type {
  FestivalConfig,
  SimulationModifiers,
  SimulationMetrics,
  WeatherCondition,
} from "../types/festival";

// Weather Impact Multipliers
const WEATHER_IMPACT = {
  sunny: { attendance: 1.0, cleanupCost: 1.0 },
  cloudy: { attendance: 0.95, cleanupCost: 1.0 },
  rainy: { attendance: 0.75, cleanupCost: 1.5 },
  extreme: { attendance: 0.5, cleanupCost: 2.0 },
} as const;

// Calculate base attendance from festival capacity and marketing
function calculateAttendance(
  config: FestivalConfig,
  modifiers: SimulationModifiers,
): number {
  const capacity = config.festival.capacity;
  const marketingMultiplier = 0.4 + (modifiers.marketingBudget / 100) * 0.6; // 40%-100% of capacity
  const reputationMultiplier = 0.7 + (modifiers.eventReputation / 100) * 0.3; // 70%-100%
  const weatherMultiplier = WEATHER_IMPACT[modifiers.weather].attendance;
  const artistDrawMultiplier =
    config.artists.reduce((sum, a) => sum + a.drawFactor, 0) /
      Math.max(config.artists.length, 1) || 1;

  const projected = Math.floor(
    capacity *
      marketingMultiplier *
      reputationMultiplier *
      weatherMultiplier *
      artistDrawMultiplier,
  );

  return Math.min(projected, capacity);
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
): number {
  let score = 100;
  score -= Math.min(toiletWaitTime * 2, 30); // Max -30 for wait times
  score -= Math.min((100 - securityStaffRatio * 100) * 0.3, 20); // Max -20 for security
  if (!vendorCapacityMet) score -= 15; // -15 if vendors can't handle crowd
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
): number {
  let score = 100;
  score -= incidents * 3;
  score += staffRatio * 15; // Good staff ratio helps
  score += Math.min(amenitiesCount * 5, 20); // Medical, parking, etc.
  return Math.max(Math.min(score, 100), 20);
}

// Calculate revenue
function calculateRevenue(
  attendance: number,
  ticketPrice: number,
  config: FestivalConfig,
): { ticketRevenue: number; vendorRevenue: number } {
  const ticketRevenue = attendance * ticketPrice;

  const vendorRevenue = config.vendors.reduce((sum, vendor) => {
    const vendorAttendance = Math.min(attendance, vendor.capacity);
    const revenue = vendorAttendance * 25; // Avg $25 per person at vendor
    return sum + revenue * vendor.commissionRate;
  }, 0);

  return { ticketRevenue, vendorRevenue };
}

// Calculate OPEX (Operating Expenses)
function calculateOPEX(
  config: FestivalConfig,
  attendance: number,
  daysOfEvent: number,
  weatherMultiplier: number,
): number {
  let opex = 0;

  // Staff costs
  config.security.forEach((staff) => {
    opex += staff.quantity * staff.costPerDay * daysOfEvent;
  });

  // Toilet maintenance
  config.toilets.forEach((toilet) => {
    const baseCost = toilet.quantity * toilet.maintenanceCostPerDay;
    opex += baseCost * daysOfEvent * weatherMultiplier;
  });

  // Amenity maintenance
  config.amenities.forEach((amenity) => {
    opex += amenity.maintenanceCostPerDay * daysOfEvent;
  });

  // Vendor support & logistics
  opex += attendance * 2; // $2 per person for logistics

  return Math.round(opex);
}

// Calculate CAPEX (Capital Expenses)
function calculateCAPEX(config: FestivalConfig): number {
  let capex = 0;

  config.stages.forEach((stage) => {
    capex += stage.setupCost;
  });

  config.amenities.forEach((amenity) => {
    capex += amenity.setupCost;
  });

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
): SimulationMetrics {
  const daysOfEvent = config.festival.durationDays;
  const ticketPrice = 50; // $50 per ticket
  const weatherMultiplier =
    WEATHER_IMPACT[modifiers.weather as WeatherCondition].cleanupCost;

  // Step 1: Calculate Attendance
  const attendance = calculateAttendance(config, modifiers);
  const peakDayAttendance = Math.ceil(attendance * 0.8); // 80% on peak day
  const attendanceByDay = Array.from({ length: daysOfEvent }, (_, i) => {
    const factor = Math.sin((i / daysOfEvent) * Math.PI) * 0.5 + 0.5;
    return Math.floor(attendance * factor);
  });

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
  );

  const securityIncidents = calculateSecurityIncidents(
    crowdSatisfaction,
    staffRatio,
  );

  const safetyRating = calculateSafetyRating(
    securityIncidents,
    staffRatio,
    config.amenities.length,
  );

  // Step 3: Financials
  const { ticketRevenue, vendorRevenue } = calculateRevenue(
    attendance,
    ticketPrice,
    config,
  );
  const totalRevenue = ticketRevenue + vendorRevenue;

  const opex = calculateOPEX(
    config,
    attendance,
    daysOfEvent,
    weatherMultiplier,
  );
  const capex = calculateCAPEX(config);

  const netProfit = totalRevenue - opex - capex;
  const breakEvenDay = Math.ceil(
    capex / Math.max(totalRevenue / daysOfEvent, 1),
  );

  // Energy usage
  const energyUsage = config.stages.reduce(
    (sum, stage) => sum + stage.powerConsumption * 24 * daysOfEvent,
    0,
  );

  // Waste
  const wasteGenerated = (attendance * 2) / 1000; // 2kg per person -> tonnes

  const staffRequired = Math.ceil(totalStaff / daysOfEvent);

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
    totalOPEX: opex,
    totalCAPEX: capex,
    netProfit: Math.round(netProfit),
    breakEvenPoint: breakEvenDay,
    energyUsage: Math.round(energyUsage),
    wasteGenerated: Math.round(wasteGenerated * 100) / 100,
    staffRequiredPerDay: staffRequired,
    grade,
    verdict,
  };
}
