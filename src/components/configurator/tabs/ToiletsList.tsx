import { useState } from "react";
import type { FestivalConfig } from "../../../types/festival";

interface ToiletsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

export function ToiletsList({ config, onConfigChange }: ToiletsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 10,
    type: "standard" as const,
    maintenanceCostPerDay: 500,
  });

  const addToilet = () => {
    const newToilet = {
      id: `toilet-${Date.now()}`,
      quantity: formData.quantity,
      type: formData.type,
      maintenanceCostPerDay: formData.maintenanceCostPerDay,
    };

    onConfigChange({
      ...config,
      toilets: [...config.toilets, newToilet],
    });

    setFormData({ quantity: 10, type: "standard", maintenanceCostPerDay: 500 });
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
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-600">{totalToilets} total toilets</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Group
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="standard">Standard</option>
            <option value="accessible">Accessible</option>
            <option value="luxury">Luxury</option>
          </select>
          <input
            type="number"
            placeholder="Maintenance cost per day ($)"
            value={formData.maintenanceCostPerDay}
            onChange={(e) =>
              setFormData({
                ...formData,
                maintenanceCostPerDay: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
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
        </div>
      )}

      <div className="space-y-2">
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
                ${toilet.maintenanceCostPerDay.toLocaleString()}/day maintenance
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
      </div>
    </div>
  );
}
