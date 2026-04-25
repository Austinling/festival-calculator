import { useState } from "react";
import type { FestivalConfig } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface ToiletsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const TOILET_PRESETS = [
  {
    key: "standard-pack",
    label: "Standard Toilets (£30/week each)",
    data: {
      quantity: 20,
      type: "standard" as const,
      maintenanceCostPerWeek: 30,
    },
  },
  {
    key: "disabled-pack",
    label: "Disabled Toilets (£50/week each)",
    data: {
      quantity: 8,
      type: "disabled" as const,
      maintenanceCostPerWeek: 50,
    },
  },
];

export function ToiletsList({ config, onConfigChange }: ToiletsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState({
    quantity: 10,
    type: "standard" as const,
    maintenanceCostPerWeek: 30,
  });

  const addToilet = () => {
    const newToilet = {
      id: `toilet-${Date.now()}`,
      quantity: formData.quantity,
      type: formData.type,
      maintenanceCostPerWeek: formData.maintenanceCostPerWeek,
    };

    onConfigChange({
      ...config,
      toilets: [...config.toilets, newToilet],
    });

    setFormData({ quantity: 10, type: "standard", maintenanceCostPerWeek: 30 });
    setSelectedPreset("custom");
    setShowForm(false);
  };

  const removeToilet = (id: string) => {
    onConfigChange({
      ...config,
      toilets: config.toilets.filter((t) => t.id !== id),
    });
  };

  const totalToilets = config.toilets.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <EntitySection
      countText={`${totalToilets} total toilets`}
      addLabel="+ Add Group"
      isOpen={showForm}
      onToggle={() => setShowForm(!showForm)}
      formContent={
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Preset
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Toilets are limited to standard and disabled units with weekly
              costs.
            </p>
            <select
              value={selectedPreset}
              onChange={(e) => {
                const presetKey = e.target.value;
                setSelectedPreset(presetKey);
                if (presetKey === "custom") {
                  return;
                }
                const preset = TOILET_PRESETS.find(
                  (item) => item.key === presetKey,
                );
                if (preset) {
                  setFormData(preset.data);
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="custom">Custom Toilet Group (manual)</option>
              {TOILET_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity *
            </label>
            <p className="text-xs text-slate-600 mb-2">
              How many of this type to install
            </p>
            <input
              type="number"
              placeholder="10"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Type
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Costs are fixed by type: standard £30/week, disabled £50/week.
            </p>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as any,
                  maintenanceCostPerWeek:
                    e.target.value === "disabled" ? 50 : 30,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="standard">Standard - Basic facilities</option>
              <option value="disabled">Disabled - Accessible facilities</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Weekly Cost Per Toilet
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Based on your requested assumptions (£/week per unit)
            </p>
            <input
              type="number"
              placeholder="30"
              value={formData.maintenanceCostPerWeek}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maintenanceCostPerWeek: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addToilet}
              className="flex-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-md bg-slate-300 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </>
      }
    >
      {config.toilets.map((toilet) => (
        <div
          key={toilet.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div>
            <p className="font-medium text-slate-900">
              {toilet.quantity} × {toilet.type}
            </p>
            <p className="text-xs text-slate-600">
              £{toilet.maintenanceCostPerWeek.toLocaleString()}/week each
            </p>
          </div>
          <button
            onClick={() => removeToilet(toilet.id)}
            className="text-slate-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </EntitySection>
  );
}
