import { useState } from "react";
import type {
  FestivalConfig,
  MedicalStaffResource,
} from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface MedicalStaffListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const MEDICAL_ROLE_DEFAULTS = {
  paramedic: {
    label: "Paramedic",
    costPerHour: 34,
    hoursPerDay: 10,
    mileageRatePerMile: 0,
  },
  nurse: {
    label: "Nurse",
    costPerHour: 27,
    hoursPerDay: 10,
    mileageRatePerMile: 0,
  },
  "first-responder": {
    label: "First Responder",
    costPerHour: 21,
    hoursPerDay: 10,
    mileageRatePerMile: 0,
  },
  "ambulance-4x4": {
    label: "Ambulance / 4x4 Unit",
    costPerHour: 19,
    hoursPerDay: 10,
    mileageRatePerMile: 0.4,
  },
  gazebo: {
    label: "Gazebo",
    costPerHour: 14,
    hoursPerDay: 10,
    mileageRatePerMile: 0,
  },
} as const;

type MedicalRole = keyof typeof MEDICAL_ROLE_DEFAULTS;

export function MedicalStaffList({
  config,
  onConfigChange,
}: MedicalStaffListProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    role: MedicalRole;
    quantity: number;
    costPerHour: number;
    hoursPerDay: number;
    mileagePerDay: number;
    mileageRatePerMile: number;
  }>({
    role: "paramedic" as MedicalRole,
    quantity: 2,
    costPerHour: MEDICAL_ROLE_DEFAULTS.paramedic.costPerHour,
    hoursPerDay: MEDICAL_ROLE_DEFAULTS.paramedic.hoursPerDay,
    mileagePerDay: 30,
    mileageRatePerMile: MEDICAL_ROLE_DEFAULTS.paramedic.mileageRatePerMile,
  });

  const addMedicalResource = () => {
    const newResource: MedicalStaffResource = {
      id: `medical-${Date.now()}`,
      role: formData.role,
      quantity: formData.quantity,
      costPerHour: formData.costPerHour,
      hoursPerDay: formData.hoursPerDay,
      mileagePerDay:
        formData.role === "ambulance-4x4" ? formData.mileagePerDay : 0,
      mileageRatePerMile:
        formData.role === "ambulance-4x4" ? formData.mileageRatePerMile : 0,
    };

    onConfigChange({
      ...config,
      medicalStaff: [...config.medicalStaff, newResource],
    });

    setFormData({
      role: "paramedic",
      quantity: 2,
      costPerHour: MEDICAL_ROLE_DEFAULTS.paramedic.costPerHour,
      hoursPerDay: MEDICAL_ROLE_DEFAULTS.paramedic.hoursPerDay,
      mileagePerDay: 30,
      mileageRatePerMile: MEDICAL_ROLE_DEFAULTS.paramedic.mileageRatePerMile,
    });
    setShowForm(false);
  };

  const removeMedicalResource = (id: string) => {
    onConfigChange({
      ...config,
      medicalStaff: config.medicalStaff.filter((item) => item.id !== id),
    });
  };

  const totalMedicalPeople = config.medicalStaff.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <EntitySection
      countText={`${totalMedicalPeople} total medical resources`}
      addLabel="+ Add Medical Resource"
      isOpen={showForm}
      onToggle={() => setShowForm(!showForm)}
      formContent={
        <>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                const role = e.target.value as MedicalRole;
                const defaults = MEDICAL_ROLE_DEFAULTS[role];
                setFormData({
                  ...formData,
                  role,
                  costPerHour: defaults.costPerHour,
                  hoursPerDay: defaults.hoursPerDay,
                  mileageRatePerMile: defaults.mileageRatePerMile,
                });
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="paramedic">Paramedic (£34/hr)</option>
              <option value="nurse">Nurse (£27/hr)</option>
              <option value="first-responder">First Responder (£21/hr)</option>
              <option value="ambulance-4x4">
                Ambulance / 4x4 (£19/hr + £0.40/mile)
              </option>
              <option value="gazebo">Gazebo (£14/hr)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Cost Per Hour
            </label>
            <input
              type="number"
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
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Hours Per Day
            </label>
            <input
              type="number"
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

          {formData.role === "ambulance-4x4" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Miles Per Day (per vehicle)
                </label>
                <input
                  type="number"
                  value={formData.mileagePerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mileagePerDay: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Mileage Rate (£/mile)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mileageRatePerMile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mileageRatePerMile: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={addMedicalResource}
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
      {config.medicalStaff.map((resource) => (
        <div
          key={resource.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div>
            <p className="font-medium text-slate-900">
              {resource.quantity} x {MEDICAL_ROLE_DEFAULTS[resource.role].label}
            </p>
            <p className="text-xs text-slate-600">
              £{resource.costPerHour}/hr • {resource.hoursPerDay}h/day
              {resource.role === "ambulance-4x4"
                ? ` • ${resource.mileagePerDay ?? 0} miles/day at £${(
                    resource.mileageRatePerMile ?? 0.4
                  ).toFixed(2)}/mile`
                : ""}
            </p>
          </div>
          <button
            onClick={() => removeMedicalResource(resource.id)}
            className="text-slate-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </EntitySection>
  );
}
