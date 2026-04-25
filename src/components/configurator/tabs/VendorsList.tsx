import { useState } from "react";
import type { FestivalConfig, Vendor } from "../../../types/festival";

interface VendorsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

export function VendorsList({ config, onConfigChange }: VendorsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "food" as const,
    capacity: 500,
    commissionRate: 0.15,
    estimatedDailyRevenue: 5000,
  });

  const addVendor = () => {
    if (!formData.name) return;

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      capacity: formData.capacity,
      commissionRate: formData.commissionRate,
      estimatedDailyRevenue: formData.estimatedDailyRevenue,
    };

    onConfigChange({
      ...config,
      vendors: [...config.vendors, newVendor],
    });

    setFormData({
      name: "",
      category: "food",
      capacity: 500,
      commissionRate: 0.15,
      estimatedDailyRevenue: 5000,
    });
    setShowForm(false);
  };

  const removeVendor = (id: string) => {
    onConfigChange({
      ...config,
      vendors: config.vendors.filter((v) => v.id !== id),
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-600">
          {config.vendors.length} vendors
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            type="text"
            placeholder="Vendor name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as typeof formData.category,
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="food">Food</option>
            <option value="merchandise">Merchandise</option>
            <option value="sponsor">Sponsor</option>
          </select>
          <input
            type="number"
            placeholder="Capacity (people/day)"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({
                ...formData,
                capacity: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Commission rate (0-1)"
            step="0.01"
            value={formData.commissionRate}
            onChange={(e) =>
              setFormData({
                ...formData,
                commissionRate: parseFloat(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Est. daily revenue ($)"
            value={formData.estimatedDailyRevenue}
            onChange={(e) =>
              setFormData({
                ...formData,
                estimatedDailyRevenue: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={addVendor}
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
        {config.vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div>
              <p className="font-medium text-slate-900">{vendor.name}</p>
              <p className="text-xs text-slate-600">
                {vendor.category} • {vendor.capacity} cap •{" "}
                {(vendor.commissionRate * 100).toFixed(0)}% commission • $
                {vendor.estimatedDailyRevenue.toLocaleString()}/day
              </p>
            </div>
            <button
              onClick={() => removeVendor(vendor.id)}
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
