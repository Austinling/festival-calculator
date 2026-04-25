import { useState } from "react";
import type { FestivalConfig } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface SecurityListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const SECURITY_PRESETS = [
  {
    key: "standard-security",
    label: "Standard Security Team",
    data: {
      quantity: 40,
      role: "perimeter" as const,
      costPerDay: 180,
    },
  },
  {
    key: "crowd-control",
    label: "Crowd Control Team",
    data: {
      quantity: 30,
      role: "crowd-control" as const,
      costPerDay: 200,
    },
  },
  {
    key: "medical-response",
    label: "Medical Response Team",
    data: {
      quantity: 15,
      role: "medical" as const,
      costPerDay: 260,
    },
  },
];

export function SecurityList({ config, onConfigChange }: SecurityListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState({
    quantity: 20,
    role: "perimeter" as const,
    costPerDay: 150,
  });

  const addStaff = () => {
    const newStaff = {
      id: `security-${Date.now()}`,
      quantity: formData.quantity,
      role: formData.role,
      costPerDay: formData.costPerDay,
    };

    onConfigChange({
      ...config,
      security: [...config.security, newStaff],
    });

    setFormData({ quantity: 20, role: "perimeter", costPerDay: 150 });
    setSelectedPreset("custom");
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
    <EntitySection
      countText={`${totalStaff} total staff members`}
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
              Load predefined staffing costs and quantities, then customize.
            </p>
            <select
              value={selectedPreset}
              onChange={(e) => {
                const presetKey = e.target.value;
                setSelectedPreset(presetKey);
                if (presetKey === "custom") {
                  return;
                }
                const preset = SECURITY_PRESETS.find(
                  (item) => item.key === presetKey,
                );
                if (preset) {
                  setFormData(preset.data);
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="custom">Custom Security Group (manual)</option>
              {SECURITY_PRESETS.map((preset) => (
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
              How many staff members in this group
            </p>
            <input
              type="number"
              placeholder="20"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role
            </label>
            <p className="text-xs text-slate-600 mb-2">
              What they do at the festival
            </p>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as any })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="perimeter">
                👮 Perimeter Security - Entrance/exit control
              </option>
              <option value="crowd-control">
                👥 Crowd Control - Floor management, safety
              </option>
              <option value="medical">
                ⚕️ Medical Staff - First aid, emergencies
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Cost Per Person
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Salary/wages per day per staff member ($)
            </p>
            <input
              type="number"
              placeholder="150"
              value={formData.costPerDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  costPerDay: parseInt(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
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
        </>
      }
    >
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
    </EntitySection>
  );
}
