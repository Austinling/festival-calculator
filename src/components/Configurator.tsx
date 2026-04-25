import { useState, useMemo } from "react";
import type { FestivalConfig } from "../types/festival";
import { ConfiguratorSidebar } from "./configurator/ConfiguratorSidebar";
import { ConfiguratorWorkspace } from "./configurator/ConfiguratorWorkspace";
import { BudgetEstimate } from "./configurator/BudgetEstimate";

interface ConfiguratorProps {
  config: FestivalConfig | null;
  onConfigChange: (config: FestivalConfig) => void;
  onSimulate: () => void;
}

export function Configurator({
  config,
  onConfigChange,
  onSimulate,
}: ConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<
    "stages" | "artists" | "vendors" | "toilets" | "security" | "amenities"
  >("stages");

  const estimate = useMemo(() => {
    if (!config) return null;

    // Calculate real-time CAPEX
    let capex = 0;
    config.stages.forEach((s) => (capex += s.setupCost));
    config.amenities.forEach((a) => (capex += a.setupCost));
    config.toilets.forEach((t) => (capex += t.quantity * 2000));

    // Calculate projected attendance based on capacity and artists
    const baseAttendance = config.festival.capacity * 0.6;
    const artistMultiplier =
      config.artists.reduce((sum, a) => sum + a.drawFactor, 0) /
        Math.max(config.artists.length, 1) || 1;
    const projectedAttendance = Math.floor(
      baseAttendance * artistMultiplier,
    );

    // Estimate daily OPEX
    let dailyOpex = 0;
    config.security.forEach((s) => (dailyOpex += s.quantity * s.costPerDay));
    config.toilets.forEach((t) => (dailyOpex += t.quantity * t.maintenanceCostPerDay));
    config.amenities.forEach((a) => (dailyOpex += a.maintenanceCostPerDay));
    dailyOpex += projectedAttendance * 2;

    const totalOpex = dailyOpex * config.festival.durationDays;

    return {
      capex,
      totalOpex,
      projectedAttendance,
      budgetRemaining: config.festival.budget - capex,
    };
  }, [config]);

  if (!config) {
    return <div className="p-6">Loading festival...</div>;
  }

  return (
    <div className="flex min-h-screen gap-4 bg-slate-50 p-4">
      {/* Left Sidebar - Menu */}
      <ConfiguratorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
  );
}
