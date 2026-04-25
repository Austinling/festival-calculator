import { simulateFestival } from "../src/logic/Simulation";
import type {
  FestivalConfig,
  SimulationModifiers,
} from "../src/types/festival";

function createBaseConfig(): FestivalConfig {
  return {
    festival: {
      id: "festival-1",
      name: "Test Fest",
      capacity: 10000,
      budget: 500000,
      dates: { start: "2026-07-01", end: "2026-07-03" },
      location: "Test Venue",
      durationDays: 3,
    },
    stages: [],
    artists: [],
    vendors: [],
    sponsors: [],
    toilets: [],
    security: [],
    medicalStaff: [],
    amenities: [],
  };
}

function createModifiers(
  overrides?: Partial<SimulationModifiers>,
): SimulationModifiers {
  return {
    weather: "sunny",
    marketingBudget: 50,
    eventReputation: 50,
    ...overrides,
  };
}

describe("simulateFestival calculations", () => {
  test("returns zero CAPEX and OPEX when no infrastructure is configured", () => {
    const config = createBaseConfig();

    const result = simulateFestival(config, createModifiers());

    expect(result.totalCAPEX).toBe(0);
    expect(result.totalOPEX).toBe(0);
  });

  test("attendance is capped at festival capacity", () => {
    const config = createBaseConfig();
    config.artists.push({
      id: "a1",
      name: "Headliner",
      stageId: "s1",
      genre: "pop",
      duration: 45,
      startTime: "21:00",
      setCost: 6000,
      ticketRevenue: 100,
      drawFactor: 2.0,
    });

    const result = simulateFestival(
      config,
      createModifiers({
        marketingBudget: 100,
        eventReputation: 100,
        weather: "sunny",
      }),
    );

    expect(result.projectedAttendance).toBeLessThanOrEqual(
      config.festival.capacity,
    );
  });

  test("rainy weather reduces projected attendance compared to sunny", () => {
    const config = createBaseConfig();
    config.artists.push({
      id: "a1",
      name: "Strong Draw",
      stageId: "s1",
      genre: "edm",
      duration: 45,
      startTime: "22:00",
      setCost: 5000,
      ticketRevenue: 80,
      drawFactor: 1.8,
    });

    const sunny = simulateFestival(
      config,
      createModifiers({ weather: "sunny" }),
    );
    const rainy = simulateFestival(
      config,
      createModifiers({ weather: "rainy" }),
    );

    expect(rainy.projectedAttendance).toBeLessThan(sunny.projectedAttendance);
  });

  test("toilet maintenance OPEX is higher in extreme weather", () => {
    const config = createBaseConfig();
    config.toilets.push({
      id: "t1",
      quantity: 10,
      type: "standard",
      maintenanceCostPerWeek: 700,
    });

    const sunny = simulateFestival(
      config,
      createModifiers({ weather: "sunny" }),
    );
    const extreme = simulateFestival(
      config,
      createModifiers({ weather: "extreme" }),
    );

    expect(extreme.totalOPEX).toBeGreaterThan(sunny.totalOPEX);
  });

  test("CAPEX includes stage, amenities, and toilet infrastructure", () => {
    const config = createBaseConfig();
    config.stages.push({
      id: "s1",
      name: "Main",
      capacity: 8000,
      type: "main",
      powerConsumption: 300,
      setupCost: 120000,
    });
    config.amenities.push({
      id: "am1",
      name: "WiFi",
      type: "wifi",
      setupCost: 20000,
      maintenanceCostPerDay: 1200,
    });
    config.toilets.push({
      id: "t1",
      quantity: 15,
      type: "standard",
      maintenanceCostPerWeek: 2100,
    });

    const result = simulateFestival(config, createModifiers());

    expect(result.totalCAPEX).toBe(120000 + 20000 + 15 * 2000);
  });

  test("net profit equals total revenue minus OPEX and CAPEX", () => {
    const config = createBaseConfig();
    config.vendors.push({
      id: "v1",
      name: "Food Vendor",
      category: "food",
      capacity: 7000,
      commissionRate: 0.2,
      estimatedDailyRevenue: 15000,
    });
    config.artists.push({
      id: "a1",
      name: "Performer",
      stageId: "s1",
      genre: "rock",
      duration: 45,
      startTime: "18:00",
      setCost: 3000,
      ticketRevenue: 30,
      drawFactor: 1.3,
    });

    const result = simulateFestival(config, createModifiers());

    expect(result.netProfit).toBe(
      result.totalRevenue - result.totalOPEX - result.totalCAPEX,
    );
  });

  test("higher marketing budget increases attendance", () => {
    const config = createBaseConfig();
    config.artists.push({
      id: "a1",
      name: "Artist",
      stageId: "s1",
      genre: "pop",
      duration: 45,
      startTime: "20:00",
      setCost: 3500,
      ticketRevenue: 50,
      drawFactor: 1.5,
    });

    const lowMarketing = simulateFestival(
      config,
      createModifiers({ marketingBudget: 0 }),
    );
    const highMarketing = simulateFestival(
      config,
      createModifiers({ marketingBudget: 100 }),
    );

    expect(highMarketing.projectedAttendance).toBeGreaterThan(
      lowMarketing.projectedAttendance,
    );
  });

  test("sponsorship deals increase total revenue", () => {
    const config = createBaseConfig();
    config.sponsors.push({
      id: "sp1",
      name: "Headline Partner",
      tier: "headline",
      profit: 100000,
    });

    const result = simulateFestival(config, createModifiers());

    expect(result.sponsorshipRevenue).toBe(100000);
    expect(result.totalRevenue).toBe(
      result.ticketRevenue +
        result.vendorCommission +
        result.sponsorshipRevenue,
    );
  });
});
