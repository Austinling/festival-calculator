import { useEffect, useMemo, useState } from "react";
import type { FestivalConfig, SimulationModifiers } from "../types/festival";
import type { ExperienceLevel } from "../logic/AuthTypes";
import {
  ConfiguratorSidebar,
  type ConfiguratorTab,
} from "./configurator/ConfiguratorSidebar";
import { ConfiguratorWorkspace } from "./configurator/ConfiguratorWorkspace";
import { BudgetEstimate } from "./configurator/BudgetEstimate.tsx";
import { simulateFestival } from "../logic/Simulation";

interface ConfiguratorProps {
  config: FestivalConfig | null;
  onConfigChange: (config: FestivalConfig) => void;
  modifiers: SimulationModifiers;
  onModifiersChange: (modifiers: SimulationModifiers) => void;
  experienceLevel: ExperienceLevel;
  onSimulate: () => void;
}

export function Configurator({
  config,
  onConfigChange,
  modifiers,
  onModifiersChange,
  experienceLevel,
  onSimulate,
}: ConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<ConfiguratorTab>("stages");
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    if (!config) return;
    if (selectedDay > config.festival.durationDays) {
      setSelectedDay(config.festival.durationDays);
    }
  }, [config, selectedDay]);

  const ticketPriceByDay = useMemo(() => {
    if (!config) return [];

    return Array.from({ length: config.festival.durationDays }, (_, index) => {
      const price = modifiers.ticketPrice[index];
      return typeof price === "number" && price > 0 ? price : 50;
    });
  }, [config, modifiers.ticketPrice]);

  const weatherByDay = useMemo(() => {
    if (!config) return [];

    return Array.from({ length: config.festival.durationDays }, (_, index) => {
      const weather = modifiers.weatherByDay[index];
      return weather ?? "sunny";
    });
  }, [config, modifiers.weatherByDay]);

  useEffect(() => {
    if (!config) return;

    const isTicketLengthValid =
      modifiers.ticketPrice.length === config.festival.durationDays;
    const isWeatherLengthValid =
      modifiers.weatherByDay.length === config.festival.durationDays;
    const hasDifferentValues = ticketPriceByDay.some(
      (price, index) => modifiers.ticketPrice[index] !== price,
    );
    const hasDifferentWeather = weatherByDay.some(
      (weather, index) => modifiers.weatherByDay[index] !== weather,
    );

    if (
      !isTicketLengthValid ||
      !isWeatherLengthValid ||
      hasDifferentValues ||
      hasDifferentWeather
    ) {
      onModifiersChange({
        ...modifiers,
        ticketPrice: ticketPriceByDay,
        weatherByDay,
      });
    }
  }, [config, modifiers, onModifiersChange, ticketPriceByDay, weatherByDay]);

  const selectedDayIndex = selectedDay - 1;
  const selectedDayTicketPrice = ticketPriceByDay[selectedDayIndex] ?? 50;
  const selectedDayWeather = weatherByDay[selectedDayIndex] ?? "sunny";

  const estimate = useMemo(() => {
    if (!config) return null;

    // 1. Run the REAL simulation logic
    const results = simulateFestival(config, modifiers, experienceLevel);
    const selectedDayAttendance =
      results.attendanceByDay[selectedDayIndex] ?? 0;
    const daysCount = Math.max(config.festival.durationDays, 1);
    const selectedDayOpex = Math.round(results.totalOPEX / daysCount);

    // 2. Map the simulation results to the UI expectations
    return {
      capex: results.totalCAPEX,
      totalOpex: selectedDayOpex,
      totalEventOpex: results.totalOPEX,
      projectedAttendance: results.projectedAttendance,
      selectedDayAttendance,
      selectedDay,
      budgetRemaining:
        config.festival.budget - results.totalCAPEX - results.totalOPEX,
      electricityCost: results.electricityCost, // Make sure this is exported from Simulation
      recommendations: {
        security: {
          current: config.security.reduce((sum, s) => sum + s.quantity, 0),
          recommended: Math.max(2, Math.ceil(selectedDayAttendance / 250)),
        },
        toilets: {
          current: config.toilets.reduce((sum, t) => sum + t.quantity, 0),
          recommended: Math.max(4, Math.ceil(selectedDayAttendance / 80)),
        },
        medical: {
          current: config.medicalStaff.reduce((sum, m) => sum + m.quantity, 0),
          recommended: Math.max(
            2,
            Math.ceil(results.projectedAttendance / 1200),
          ),
        },
        staff: {
          current:
            config.security.reduce((sum, s) => sum + s.quantity, 0) +
            config.medicalStaff.reduce((sum, m) => sum + m.quantity, 0),
          recommended: 10, // Or whatever logic you prefer
        },
      },
    };
  }, [config, modifiers, selectedDay, selectedDayIndex, experienceLevel]);

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Festival Budget
            </label>
            <input
              type="range"
              min="50000"
              max="50000000"
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
              <span>$50m</span>
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
              max="500000"
              step="5000"
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
              <span>$0</span>
              <span className="font-semibold text-slate-900">
                ${modifiers.marketingBudget.toLocaleString()}
              </span>
              <span>$500k</span>
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
              Ticket Price
            </label>
            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={selectedDayTicketPrice}
              onChange={(event) => {
                const updatedTicketPrices = [...ticketPriceByDay];
                updatedTicketPrices[selectedDayIndex] = Number(
                  event.target.value,
                );

                onModifiersChange({
                  ...modifiers,
                  ticketPrice: updatedTicketPrices,
                });
              }}
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>$20</span>
              <span className="font-semibold text-slate-900">
                ${selectedDayTicketPrice.toLocaleString()}
              </span>
              <span>$500</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Weather Forecast
            </label>
            <select
              value={selectedDayWeather}
              onChange={(event) => {
                const updatedWeatherByDay = [...weatherByDay];
                updatedWeatherByDay[selectedDayIndex] = event.target
                  .value as SimulationModifiers["weatherByDay"][number];

                onModifiersChange({
                  ...modifiers,
                  weatherByDay: updatedWeatherByDay,
                });
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="sunny">Sunny</option>
              <option value="cloudy">Cloudy</option>
              <option value="rainy">Rainy</option>
              <option value="extreme">Extreme</option>
            </select>
            <div className="mt-2 text-xs text-slate-600">
              Forecast for Day {selectedDay}; used in day-specific attendance.
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Day Selector
            </label>
            <select
              value={selectedDay}
              onChange={(event) => setSelectedDay(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              {Array.from(
                { length: config.festival.durationDays },
                (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Day {index + 1}
                  </option>
                ),
              )}
            </select>
            <div className="mt-2 text-xs text-slate-600">
              Editing turnout and ticket price for Day {selectedDay}
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
