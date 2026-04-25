import { useState } from "react";
import type { FestivalConfig, Stage } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface StagesListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const STAGE_PRESETS = [
  {
    key: "main-mega",
    label: "Mega Main Stage",
    data: {
      name: "Mega Main Stage",
      capacity: 50000,
      type: "main" as const,
      powerConsumption: 450,
      setupCost: 350000,
    },
  },
  {
    key: "electronic-tent",
    label: "Electronic Tent",
    data: {
      name: "Electronic Tent",
      capacity: 12000,
      type: "secondary" as const,
      powerConsumption: 220,
      setupCost: 120000,
    },
  },
  {
    key: "vip-lounge",
    label: "VIP Lounge Stage",
    data: {
      name: "VIP Lounge Stage",
      capacity: 3500,
      type: "vip" as const,
      powerConsumption: 70,
      setupCost: 60000,
    },
  },
];

export function StagesList({ config, onConfigChange }: StagesListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState({
    name: "",
    capacity: 1000,
    type: "secondary" as const,
    powerConsumption: 50,
    setupCost: 5000,
  });

  const addStage = () => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: formData.name,
      capacity: formData.capacity,
      type: formData.type,
      powerConsumption: formData.powerConsumption,
      setupCost: formData.setupCost,
    };

    onConfigChange({
      ...config,
      stages: [...config.stages, newStage],
    });

    setFormData({
      name: "",
      capacity: 1000,
      type: "secondary",
      powerConsumption: 50,
      setupCost: 5000,
    });
    setSelectedPreset("custom");
    setShowForm(false);
  };

  const removeStage = (id: string) => {
    onConfigChange({
      ...config,
      stages: config.stages.filter((s) => s.id !== id),
    });
  };

  return (
    <EntitySection
      countText={`${config.stages.length} stages`}
      addLabel="+ Add Stage"
      isOpen={showForm}
      onToggle={() => setShowForm(!showForm)}
      formContent={
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Preset
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Pick a starter template, then adjust any field below.
            </p>
            <select
              value={selectedPreset}
              onChange={(e) => {
                const presetKey = e.target.value;
                setSelectedPreset(presetKey);
                if (presetKey === "custom") {
                  return;
                }
                const preset = STAGE_PRESETS.find(
                  (item) => item.key === presetKey,
                );
                if (preset) {
                  setFormData(preset.data);
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="custom">Custom Stage (manual)</option>
              {STAGE_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stage Name *
            </label>
            <p className="text-xs text-slate-600 mb-2">
              e.g., "Main Stage", "Electronic Tent", "Jazz Area"
            </p>
            <input
              type="text"
              placeholder="e.g., Main Stage"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Capacity
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Max people who can watch at once
            </p>
            <input
              type="number"
              placeholder="1000"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: parseInt(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stage Type
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Affects budget and event layout
            </p>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as typeof formData.type,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="main">
                🎪 Main - Headliners, biggest audience
              </option>
              <option value="secondary">🎭 Secondary - Other main acts</option>
              <option value="workshop">
                📚 Workshop - Talks, demos, smaller crowds
              </option>
              <option value="vip">👑 VIP - Exclusive performances</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Power Consumption
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Estimated power draw in kW (lights, sound, etc)
            </p>
            <input
              type="number"
              placeholder="50"
              value={formData.powerConsumption}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  powerConsumption: parseInt(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Setup Cost
            </label>
            <p className="text-xs text-slate-600 mb-2">
              One-time construction/installation cost ($)
            </p>
            <input
              type="number"
              placeholder="5000"
              value={formData.setupCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  setupCost: parseInt(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addStage}
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
      {config.stages.map((stage) => (
        <div
          key={stage.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div>
            <p className="font-medium text-slate-900">{stage.name}</p>
            <p className="text-xs text-slate-600">
              {stage.capacity.toLocaleString()} cap • {stage.type} • $
              {stage.setupCost.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => removeStage(stage.id)}
            className="text-slate-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </EntitySection>
  );
}
