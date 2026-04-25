import { useState, useMemo } from "react";
import type { FestivalConfig, SimulationModifiers } from "../types/festival";
import {
  ConfiguratorSidebar,
  type ConfiguratorTab,
} from "./configurator/ConfiguratorSidebar";
import { ConfiguratorWorkspace } from "./configurator/ConfiguratorWorkspace";
import { BudgetEstimate } from "./configurator/BudgetEstimate.tsx";

type EventSizeTier = "small" | "medium" | "large";

function getEventSizeTier(stageCount: number): EventSizeTier {
  if (stageCount > 5) return "large";
  if (stageCount >= 3) return "medium";
  return "small";
}

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

const ELECTRICITY_RATE_PER_KWH = 0.2467;
const MEDICAL_ZONE_FLAT_COST = 15000;

interface ConfiguratorProps {
  config: FestivalConfig | null;
  onConfigChange: (config: FestivalConfig) => void;
  modifiers: SimulationModifiers;
  onModifiersChange: (modifiers: SimulationModifiers) => void;
  onSimulate: () => void;
}

export function Configurator({
  config,
  onConfigChange,
  modifiers,
  onModifiersChange,
  onSimulate,
}: ConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<ConfiguratorTab>("stages");

  const estimate = useMemo(() => {
    if (!config) return null;
    const eventSizeTier = getEventSizeTier(config.stages.length);

    // Calculate real-time CAPEX
    let capex = 0;
    config.stages.forEach((s) => (capex += s.setupCost));
    config.amenities.forEach((a) => {
      if (a.type === "parking") {
        capex += PARKING_FIXED_COST_BY_EVENT_SIZE[eventSizeTier];
        return;
      }
      capex += a.setupCost;
    });
    config.toilets.forEach((t) => (capex += t.quantity * 2000));

    // Calculate projected attendance from lineup strength and event support
    const averageArtistDraw =
      config.artists.length > 0
        ? config.artists.reduce((sum, artist) => sum + artist.drawFactor, 0) /
          config.artists.length
        : 0.35;

    const stageCoverage = Math.min(
      config.artists.length / Math.max(config.stages.length, 1),
      1.5,
    );

    const totalToilets = config.toilets.reduce(
      (sum, toilet) => sum + toilet.quantity,
      0,
    );

    const supportBoost = Math.min(
      0.35,
      config.vendors.length * 0.03 +
        config.security.length * 0.02 +
        config.amenities.length * 0.025 +
        (totalToilets / Math.max(config.festival.capacity / 100, 1)) * 0.002,
    );

    const projectedAttendance = Math.min(
      Math.floor(
        config.festival.capacity *
          0.12 *
          (0.7 + averageArtistDraw * 0.5) *
          (1 + stageCoverage * 0.25) *
          (1 + supportBoost),
      ),
      config.festival.capacity,
    );

    // Estimate daily OPEX
    let dailyOpex = 0;
    const totalElectricityCost = config.stages.reduce(
      (sum, stage) =>
        sum +
        stage.powerConsumption *
          24 *
          config.festival.durationDays *
          ELECTRICITY_RATE_PER_KWH,
      0,
    );

    config.security.forEach(
      (s) => (dailyOpex += s.quantity * s.costPerHour * s.hoursPerDay),
    );
    config.toilets.forEach(
      (t) => (dailyOpex += t.quantity * (t.maintenanceCostPerWeek / 7)),
    );
    config.medicalStaff.forEach((staff) => {
      dailyOpex += staff.quantity * staff.costPerHour * staff.hoursPerDay;
      if (staff.role === "ambulance-4x4") {
        dailyOpex +=
          staff.quantity *
          (staff.mileagePerDay ?? 0) *
          (staff.mileageRatePerMile ?? 0.4);
      }
    });
    config.amenities.forEach((a) => {
      if (a.type === "parking") {
        dailyOpex += PARKING_VARIABLE_COST_PER_DAY_BY_EVENT_SIZE[eventSizeTier];
        return;
      }
      if (a.type === "wifi") {
        dailyOpex +=
          WIFI_COST_BY_EVENT_SIZE[eventSizeTier] / config.festival.durationDays;
        return;
      }
      dailyOpex += a.maintenanceCostPerDay;
    });

    if (config.medicalStaff.length > 0) {
      capex += MEDICAL_ZONE_FLAT_COST;
    }

    dailyOpex +=
      totalElectricityCost / Math.max(config.festival.durationDays, 1);

    const hasOperationalCosts =
      config.security.length > 0 ||
      config.medicalStaff.length > 0 ||
      config.toilets.length > 0 ||
      config.amenities.length > 0 ||
      config.vendors.length > 0;

    if (hasOperationalCosts) {
      dailyOpex += Math.ceil(projectedAttendance / 1000) * 250;
    }

    const totalOpex = dailyOpex * config.festival.durationDays;

    const currentSecurity = config.security.reduce(
      (sum, staff) => sum + staff.quantity,
      0,
    );
    const currentToilets = config.toilets.reduce(
      (sum, toilet) => sum + toilet.quantity,
      0,
    );
    const currentMedical = config.medicalStaff.reduce(
      (sum, staff) => sum + staff.quantity,
      0,
    );
    const currentOpsStaff = currentSecurity + currentMedical;

    const recommendedSecurity = Math.max(
      2,
      Math.ceil(projectedAttendance / 250),
    );
    const recommendedToilets = Math.max(4, Math.ceil(projectedAttendance / 80));
    const recommendedMedical = Math.max(
      2,
      Math.ceil(projectedAttendance / 1200) +
        Math.ceil(config.stages.length / 2),
    );
    const recommendedOpsStaff =
      recommendedSecurity +
      recommendedMedical +
      Math.max(config.stages.length * 2, Math.ceil(config.artists.length / 4));

    return {
      capex,
      totalOpex,
      projectedAttendance,
      budgetRemaining: config.festival.budget - capex,
      electricityCost: Math.round(totalElectricityCost),
      recommendations: {
        security: {
          current: currentSecurity,
          recommended: recommendedSecurity,
        },
        toilets: { current: currentToilets, recommended: recommendedToilets },
        medical: { current: currentMedical, recommended: recommendedMedical },
        staff: { current: currentOpsStaff, recommended: recommendedOpsStaff },
      },
    };
  }, [config]);

  if (!config) {
    return <div className="p-6">Loading festival...</div>;
  }

  const updateFestival = (updates: Partial<FestivalConfig["festival"]>) => {
    onConfigChange({
      ...config,
      festival: {
        ...config.festival,
        ...updates,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Festival Budget
            </label>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="50000"
              value={config.festival.budget}
              onChange={(event) =>
                updateFestival({ budget: Number(event.target.value) })
              }
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>$50k</span>
              <span className="font-semibold text-slate-900">
                ${config.festival.budget.toLocaleString()}
              </span>
              <span>$5m</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Festival Capacity
            </label>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={config.festival.capacity}
              onChange={(event) =>
                updateFestival({ capacity: Number(event.target.value) })
              }
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>500</span>
              <span className="font-semibold text-slate-900">
                {config.festival.capacity.toLocaleString()} people
              </span>
              <span>100k</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Marketing Budget
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={modifiers.marketingBudget}
              onChange={(event) =>
                onModifiersChange({
                  ...modifiers,
                  marketingBudget: Number(event.target.value),
                })
              }
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>0%</span>
              <span className="font-semibold text-slate-900">
                {modifiers.marketingBudget}%
              </span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Event Reputation
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={modifiers.eventReputation}
              onChange={(event) =>
                onModifiersChange({
                  ...modifiers,
                  eventReputation: Number(event.target.value),
                })
              }
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>0%</span>
              <span className="font-semibold text-slate-900">
                {modifiers.eventReputation}%
              </span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Festival Duration (days)
            </label>
            <input
              type="range"
              min="1"
              max="14"
              step="1"
              value={config.festival.durationDays}
              onChange={(event) =>
                updateFestival({ durationDays: Number(event.target.value) })
              }
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>1</span>
              <span className="font-semibold text-slate-900">
                {config.festival.durationDays} day
                {config.festival.durationDays > 1 ? "s" : ""}
              </span>
              <span>14</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Ticket Cost
            </label>
            <input
              type="range"
              min="20"
              max="200"
              step="1"
              value={config.festival.durationDays}
              onChange={(event) =>
                updateFestival({ durationDays: Number(event.target.value) })
              }
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>1</span>
              <span className="font-semibold text-slate-900">
                {config.festival.durationDays} day
                {config.festival.durationDays > 1 ? "s" : ""}
              </span>
              <span>14</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left Sidebar - Menu */}
        <ConfiguratorSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Center Workspace */}
        <ConfiguratorWorkspace
          config={config}
          activeTab={activeTab}
          onConfigChange={onConfigChange}
        />

        {/* Right Sidebar - Budget & Capacity Estimate */}
        <BudgetEstimate
          estimate={estimate}
          budget={config.festival.budget}
          capacity={config.festival.capacity}
          onSimulate={onSimulate}
        />
      </div>
    </div>
  );
}
