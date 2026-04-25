import { useState } from "react";
import type { FestivalConfig } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface AmenitiesListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const AMENITY_LABELS: Record<string, string> = {
  parking: "Parking Area",
  camping: "Camping Ground",
  medical: "Medical Tent",
  "lost-found": "Lost & Found",
  wifi: "WiFi Network",
  charging: "Phone Charging Stations",
};

const AMENITY_PRESETS = [
  {
    key: "main-parking",
    label: "Main Parking Complex",
    data: {
      name: "Main Parking Complex",
      type: "parking" as const,
      setupCost: 45000,
      maintenanceCostPerDay: 3500,
    },
  },
  {
    key: "medical-zone",
    label: "Medical Zone",
    data: {
      name: "Central Medical Zone",
      type: "medical" as const,
      setupCost: 30000,
      maintenanceCostPerDay: 2800,
    },
  },
  {
    key: "wifi-grid",
    label: "Festival WiFi Grid",
    data: {
      name: "Festival WiFi Grid",
      type: "wifi" as const,
      setupCost: 25000,
      maintenanceCostPerDay: 1500,
    },
  },
];

export function AmenitiesList({ config, onConfigChange }: AmenitiesListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState({
    name: "",
    type: "parking" as const,
    setupCost: 5000,
    maintenanceCostPerDay: 500,
  });

  const addAmenity = () => {
    if (!formData.name) return;

    const newAmenity = {
      id: `amenity-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      setupCost: formData.setupCost,
      maintenanceCostPerDay: formData.maintenanceCostPerDay,
    };

    onConfigChange({
      ...config,
      amenities: [...config.amenities, newAmenity],
    });

    setFormData({
      name: "",
      type: "parking",
      setupCost: 5000,
      maintenanceCostPerDay: 500,
    });
    setSelectedPreset("custom");
    setShowForm(false);
  };

  const removeAmenity = (id: string) => {
    onConfigChange({
      ...config,
      amenities: config.amenities.filter((a) => a.id !== id),
    });
  };

  return (
    <EntitySection
      countText={`${config.amenities.length} amenities`}
      addLabel="+ Add Amenity"
      isOpen={showForm}
      onToggle={() => setShowForm(!showForm)}
      formContent={
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Preset
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Start with a predefined amenity setup, then adjust details.
            </p>
            <select
              value={selectedPreset}
              onChange={(e) => {
                const presetKey = e.target.value;
                setSelectedPreset(presetKey);
                if (presetKey === "custom") {
                  return;
                }
                const preset = AMENITY_PRESETS.find(
                  (item) => item.key === presetKey,
                );
                if (preset) {
                  setFormData(preset.data);
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="custom">Custom Amenity (manual)</option>
              {AMENITY_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amenity Name *
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Custom name (e.g., "North Parking Lot", "VIP Lounge")
            </p>
            <input
              type="text"
              placeholder="e.g., Main Parking Lot"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Type
            </label>
            <p className="text-xs text-slate-600 mb-2">
              What kind of amenity is this?
            </p>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="parking">🅿️ {AMENITY_LABELS.parking}</option>
              <option value="camping">⛺ {AMENITY_LABELS.camping}</option>
              <option value="medical">⚕️ {AMENITY_LABELS.medical}</option>
              <option value="lost-found">
                📦 {AMENITY_LABELS["lost-found"]}
              </option>
              <option value="wifi">📶 {AMENITY_LABELS.wifi}</option>
              <option value="charging">🔋 {AMENITY_LABELS.charging}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Setup Cost
            </label>
            <p className="text-xs text-slate-600 mb-2">
              One-time cost to build/install ($)
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Maintenance
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Upkeep per day for entire festival ($)
            </p>
            <input
              type="number"
              placeholder="500"
              value={formData.maintenanceCostPerDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maintenanceCostPerDay: parseInt(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addAmenity}
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
      {config.amenities.map((amenity) => (
        <div
          key={amenity.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div>
            <p className="font-medium text-slate-900">{amenity.name}</p>
            <p className="text-xs text-slate-600">
              {AMENITY_LABELS[amenity.type]} • $
              {amenity.setupCost.toLocaleString()} setup • $
              {amenity.maintenanceCostPerDay.toLocaleString()}/day
            </p>
          </div>
          <button
            onClick={() => removeAmenity(amenity.id)}
            className="text-slate-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </EntitySection>
  );
}
