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
    weatherByDay: ["sunny", "sunny", "sunny"],
    marketingBudget: 0,
    eventReputation: 30,
    ticketPrice: [60, 60, 60],
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

  test("attendance is capped at boosted marketing cap", () => {
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
        marketingBudget: 200000,
        eventReputation: 100,
        weatherByDay: ["sunny", "sunny", "sunny"],
      }),
    );

    expect(result.projectedAttendance).toBeLessThanOrEqual(
      config.festival.capacity * 2,
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
      drawFactor: 1.0,
    });

    const sunny = simulateFestival(
      config,
      createModifiers({ weatherByDay: ["sunny", "sunny", "sunny"] }),
    );
    const rainy = simulateFestival(
      config,
      createModifiers({ weatherByDay: ["rainy", "rainy", "rainy"] }),
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
      createModifiers({ weatherByDay: ["sunny", "sunny", "sunny"] }),
    );
    const extreme = simulateFestival(
      config,
      createModifiers({ weatherByDay: ["extreme", "extreme", "extreme"] }),
    );

    expect(extreme.totalOPEX).toBeGreaterThan(sunny.totalOPEX);
  });

  test("experienced profile gets lower OPEX than beginner", () => {
    const config = createBaseConfig();
    config.toilets.push({
      id: "t1",
      quantity: 10,
      type: "standard",
      maintenanceCostPerWeek: 700,
    });
    config.security.push({
      id: "sec-1",
      quantity: 20,
      role: "general-officer",
      costPerHour: 18,
      hoursPerDay: 10,
    });

    const beginner = simulateFestival(config, createModifiers(), "beginner");
    const experienced = simulateFestival(
      config,
      createModifiers(),
      "experienced",
    );

    expect(experienced.totalOPEX).toBeLessThan(beginner.totalOPEX);
  });

  test("14-day model enforces zero attendance without artists and keeps flat marketing OPEX non-discounted", () => {
    const config = createBaseConfig();
    config.festival.durationDays = 14;

    const result = simulateFestival(
      config,
      createModifiers({
        marketingBudget: 50000,
        weatherByDay: Array(14).fill("sunny"),
        ticketPrice: Array(14).fill(60),
      }),
      "experienced",
    );

    expect(result.attendanceByDay).toEqual(Array(14).fill(0));
    expect(result.projectedAttendance).toBe(0);
    expect(result.totalOPEX).toBe(50000);
  });

  test("rainy weather doubles waste cleanup pressure and increases OPEX vs sunny", () => {
    const config = createBaseConfig();
    config.artists.push(
      {
        id: "a1",
        name: "Day 1",
        stageId: "s1",
        performanceDay: 1,
        genre: "pop",
        duration: 45,
        startTime: "18:00",
        setCost: 2500,
        ticketRevenue: 0,
        drawFactor: 1.1,
      },
      {
        id: "a2",
        name: "Day 2",
        stageId: "s1",
        performanceDay: 2,
        genre: "pop",
        duration: 45,
        startTime: "19:00",
        setCost: 2500,
        ticketRevenue: 0,
        drawFactor: 1.1,
      },
      {
        id: "a3",
        name: "Day 3",
        stageId: "s1",
        performanceDay: 3,
        genre: "pop",
        duration: 45,
        startTime: "20:00",
        setCost: 2500,
        ticketRevenue: 0,
        drawFactor: 1.1,
      },
    );

    const sunny = simulateFestival(
      config,
      createModifiers({ weatherByDay: ["sunny", "sunny", "sunny"] }),
    );
    const rainy = simulateFestival(
      config,
      createModifiers({ weatherByDay: ["rainy", "rainy", "rainy"] }),
    );

    expect(rainy.totalOPEX).toBeGreaterThan(sunny.totalOPEX);
  });

  test("events over 5 days apply staff fatigue premium", () => {
    const config = createBaseConfig();
    config.festival.durationDays = 6;
    config.security.push({
      id: "sec-fatigue",
      quantity: 10,
      role: "general-officer",
      costPerHour: 10,
      hoursPerDay: 10,
    });

    const result = simulateFestival(
      config,
      createModifiers({
        marketingBudget: 0,
        weatherByDay: Array(6).fill("sunny"),
        ticketPrice: Array(6).fill(60),
      }),
      "beginner",
    );

    const expectedStaffingOpexWithFatigue = 10 * 10 * 10 * 6 * 1.2;
    expect(result.totalOPEX).toBe(expectedStaffingOpexWithFatigue);
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
      createModifiers({ marketingBudget: 200000 }),
    );

    expect(highMarketing.projectedAttendance).toBeGreaterThan(
      lowMarketing.projectedAttendance,
    );
  });

  test("higher ticket price reduces projected attendance", () => {
    const config = createBaseConfig();
    config.artists.push({
      id: "a-price-1",
      name: "Price Sensitive Draw",
      stageId: "s1",
      performanceDay: 1,
      genre: "pop",
      duration: 45,
      startTime: "20:00",
      setCost: 3000,
      ticketRevenue: 0,
      drawFactor: 1.5,
    });

    const cheapTickets = simulateFestival(
      config,
      createModifiers({ ticketPrice: [30, 30, 30] }),
    );
    const expensiveTickets = simulateFestival(
      config,
      createModifiers({ ticketPrice: [300, 300, 300] }),
    );

    expect(expensiveTickets.projectedAttendance).toBeLessThan(
      cheapTickets.projectedAttendance,
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
