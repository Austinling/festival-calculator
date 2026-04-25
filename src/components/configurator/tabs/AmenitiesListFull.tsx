import { useState } from "react";
import type { FestivalConfig, Amenity } from "../../../types/festival";

interface AmenitiesListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const AMENITY_TYPES = [
  "parking",
  "camping",
  "medical",
  "lost-found",
  "wifi",
  "charging",
] as const;

const AMENITY_LABELS: Record<string, string> = {
  parking: "Parking Area",
  camping: "Camping Ground",
  medical: "Medical Tent",
  "lost-found": "Lost & Found",
  wifi: "WiFi Network",
  charging: "Phone Charging Stations",
};

export function AmenitiesList({ config, onConfigChange }: AmenitiesListProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "parking" as const,
    setupCost: 5000,
    maintenanceCostPerDay: 500,
  });

  const addAmenity = () => {
    if (!formData.name) return;

    const newAmenity: Amenity = {
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
    setShowForm(false);
  };

  const removeAmenity = (id: string) => {
    onConfigChange({
      ...config,
      amenities: config.amenities.filter((a) => a.id !== id),
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-600">
          {config.amenities.length} amenities
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Amenity
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            type="text"
            placeholder="Amenity name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            {AMENITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {AMENITY_LABELS[type]}
              </option>
            ))}
          </select>
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
        </div>
      )}

      <div className="space-y-2">
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
      </div>
    </div>
  );
}
