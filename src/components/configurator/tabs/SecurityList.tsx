import { useState } from "react";
import type { FestivalConfig } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface SecurityListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const SECURITY_PRESETS = [
  {
    key: "general-security",
    label: "General Security Officer (£15/hr)",
    data: {
      quantity: 20,
      role: "general-officer" as const,
      costPerHour: 15,
      hoursPerDay: 10,
    },
  },
  {
    key: "door-supervisor",
    label: "Door Supervisor (£20/hr)",
    data: {
      quantity: 12,
      role: "door-supervisor" as const,
      costPerHour: 20,
      hoursPerDay: 10,
    },
  },
  {
    key: "traffic-management",
    label: "Car Park / Traffic (£15/hr)",
    data: {
      quantity: 8,
      role: "traffic-management" as const,
      costPerHour: 15,
      hoursPerDay: 10,
    },
  },
];

export function SecurityList({ config, onConfigChange }: SecurityListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState<{
    quantity: number;
    role: "general-officer" | "door-supervisor" | "traffic-management";
    costPerHour: number;
    hoursPerDay: number;
  }>({
    quantity: 20,
    role: "general-officer",
    costPerHour: 15,
    hoursPerDay: 10,
  });

  const addStaff = () => {
    const newStaff = {
      id: `security-${Date.now()}`,
      quantity: formData.quantity,
      role: formData.role,
      costPerHour: formData.costPerHour,
      hoursPerDay: formData.hoursPerDay,
    };

    onConfigChange({
      ...config,
      security: [...config.security, newStaff],
    });

    setFormData({
      quantity: 20,
      role: "general-officer",
      costPerHour: 15,
      hoursPerDay: 10,
    });
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
              Fixed role options and hourly rates from your assumptions.
            </p>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as any,
                  costPerHour: e.target.value === "door-supervisor" ? 20 : 15,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="general-officer">
                👮 General Security Officer
              </option>
              <option value="door-supervisor">🚪 Door Supervisor</option>
              <option value="traffic-management">
                🚗 Car Park / Traffic Management
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cost Per Hour
            </label>
            <p className="text-xs text-slate-600 mb-2">
              General: £15/hr, Door Supervisor: £19-£21/hr, Traffic: £15/hr
            </p>
            <input
              type="number"
              placeholder="15"
              value={formData.costPerHour}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  costPerHour: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hours Per Day
            </label>
            <input
              type="number"
              placeholder="10"
              value={formData.hoursPerDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoursPerDay: parseInt(e.target.value, 10) || 0,
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
              £{staff.costPerHour}/hr • {staff.hoursPerDay}h/day
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
