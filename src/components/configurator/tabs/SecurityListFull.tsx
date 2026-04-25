import { useState } from "react";
import type { FestivalConfig, SecurityStaff } from "../../../types/festival";

interface SecurityListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

export function SecurityList({ config, onConfigChange }: SecurityListProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 20,
    role: "perimeter" as const,
    costPerDay: 150,
  });

  const addStaff = () => {
    const newStaff: SecurityStaff = {
      id: `security-${Date.now()}`,
      quantity: formData.quantity,
      role: formData.role,
      costPerDay: formData.costPerDay,
    };

    onConfigChange({
      ...config,
      security: [...config.security, newStaff],
    });

    setFormData({
      quantity: 20,
      role: "perimeter",
      costPerDay: 150,
    });
    setShowForm(false);
  };

  const removeStaff = (id: string) => {
    onConfigChange({
      ...config,
      security: config.security.filter((s) => s.id !== id),
    });
  };

  const totalStaff = config.security.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-600">
          {totalStaff} total staff members
        </p>
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
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as typeof formData.role,
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="perimeter">Perimeter Security</option>
            <option value="crowd-control">Crowd Control</option>
            <option value="medical">Medical Staff</option>
          </select>
          <input
            type="number"
            placeholder="Cost per day per person ($)"
            value={formData.costPerDay}
            onChange={(e) =>
              setFormData({
                ...formData,
                costPerDay: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={addStaff}
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
        {config.security.map((staff) => (
          <div
            key={staff.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div>
              <p className="font-medium text-slate-900">
                {staff.quantity} × {staff.role}
              </p>
              <p className="text-xs text-slate-600">
                ${staff.costPerDay}/day per person
              </p>
            </div>
            <button
              onClick={() => removeStaff(staff.id)}
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
