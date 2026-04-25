import { useState } from "react";
import type { FestivalConfig, Stage } from "../../../types/festival";

interface StagesListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

export function StagesList({ config, onConfigChange }: StagesListProps) {
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(false);
  };

  const removeStage = (id: string) => {
    onConfigChange({
      ...config,
      stages: config.stages.filter((s) => s.id !== id),
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-600">{config.stages.length} stages</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Stage
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            type="text"
            placeholder="Stage name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({
                ...formData,
                capacity: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
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
            <option value="main">Main</option>
            <option value="secondary">Secondary</option>
            <option value="workshop">Workshop</option>
            <option value="vip">VIP</option>
          </select>
          <input
            type="number"
            placeholder="Power (kW)"
            value={formData.powerConsumption}
            onChange={(e) =>
              setFormData({
                ...formData,
                powerConsumption: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Setup cost ($)"
            value={formData.setupCost}
            onChange={(e) =>
              setFormData({
                ...formData,
                setupCost: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
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
        </div>
      )}

      <div className="space-y-2">
        {config.stages.map((stage) => (
          <div
            key={stage.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div>
              <p className="font-medium text-slate-900">{stage.name}</p>
              <p className="text-xs text-slate-600">
                {stage.capacity.toLocaleString()} cap • {stage.type} • ${stage.setupCost.toLocaleString()}
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
      </div>
    </div>
  );
}
