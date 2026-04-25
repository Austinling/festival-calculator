// Stage Tier Definitions
// These define three standard stage types with power consumption, costs, capacity, and staffing

export type StageTierType = "small" | "medium" | "large";

export interface StageTier {
  id: StageTierType;
  name: string;
  capacity: number; // Maximum audience
  powerConsumption: number; // kW
  fixedCost: number; // £ setup cost
  variableCostPerHour: number; // £ for staff/maintenance per hour
  recommendedStaff: string;
  stageType: "main" | "secondary" | "small";
}

// Tier definitions based on UK festival standards
export const STAGE_TIERS: Record<StageTierType, StageTier> = {
  small: {
    id: "small",
    name: "Small Stage",
    capacity: 300,
    powerConsumption: 20, // kW
    fixedCost: 300, // £
    variableCostPerHour: 50, // £/hr
    recommendedStaff: "1 Junior Tech",
    stageType: "small",
  },
  medium: {
    id: "medium",
    name: "Secondary Stage",
    capacity: 1500,
    powerConsumption: 120, // kW
    fixedCost: 750, // £
    variableCostPerHour: 140, // £/hr
    recommendedStaff: "2 Engineers + 2 Crew",
    stageType: "secondary",
  },
  large: {
    id: "large",
    name: "Main Stage",
    capacity: 20000,
    powerConsumption: 800, // kW
    fixedCost: 3500, // £
    variableCostPerHour: 550, // £/hr
    recommendedStaff: "4 Senior Techs + 4 Crew",
    stageType: "main",
  },
};

// Electricity rate: £0.2467 per kWh
export const ELECTRICITY_RATE_PER_KWH = 0.2467;

/**
 * Get a tier definition by ID
 */
export function getTierById(tierId: StageTierType): StageTier {
  return STAGE_TIERS[tierId];
}

/**
 * Calculate electricity cost for a stage
 * @param powerConsumptionKW - Power consumption in kW
 * @param hoursOfOperation - Total hours of operation (e.g., 24 for a full day)
 * @param daysOfEvent - Number of days
 * @returns Cost in £
 */
export function calculateElectricityCost(
  powerConsumptionKW: number,
  hoursOfOperation: number,
  daysOfEvent: number,
): number {
  const totalKWh = powerConsumptionKW * hoursOfOperation * daysOfEvent;
  return totalKWh * ELECTRICITY_RATE_PER_KWH;
}

/**
 * Calculate staffing cost for a stage tier
 * @param variableCostPerHour - Variable cost per hour from tier
 * @param hoursOfOperation - Total hours of operation
 * @param daysOfEvent - Number of days
 * @param fixedCost - Fixed cost from tier
 * @returns Total staffing/maintenance cost in £
 */
export function calculateStaffingCost(
  variableCostPerHour: number,
  hoursOfOperation: number,
  daysOfEvent: number,
  fixedCost: number,
): number {
  const variableCost = variableCostPerHour * hoursOfOperation * daysOfEvent;
  return fixedCost + variableCost;
}

/**
 * Get preset values for stage form based on tier
 */
export function getStageFormDefaults(tierId: StageTierType) {
  const tier = STAGE_TIERS[tierId];
  return {
    name: tier.name,
    capacity: tier.capacity,
    type: tier.stageType,
    powerConsumption: tier.powerConsumption,
    setupCost: tier.fixedCost,
    tierId: tierId,
  };
}
