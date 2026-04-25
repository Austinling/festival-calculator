import { useState } from "react";
import type { FestivalConfig, Vendor } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface VendorsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const VENDOR_PRESETS = [
  {
    key: "food-truck",
    label: "Food Truck Cluster",
    data: {
      name: "Street Bites Food Truck",
      category: "food" as const,
      capacity: 1800,
      commissionRate: 0.18,
      estimatedDailyRevenue: 18000,
    },
  },
  {
    key: "merch-booth",
    label: "Official Merch Booth",
    data: {
      name: "Official Festival Merch",
      category: "merchandise" as const,
      capacity: 900,
      commissionRate: 0.2,
      estimatedDailyRevenue: 25000,
    },
  },
  {
    key: "merch-pop-up",
    label: "Pop-up Merchandise Kiosk",
    data: {
      name: "Limited Merch Pop-up",
      category: "merchandise" as const,
      capacity: 600,
      commissionRate: 0.18,
      estimatedDailyRevenue: 12000,
    },
  },
];

export function VendorsList({ config, onConfigChange }: VendorsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState<{
    name: string;
    category: Vendor["category"];
    capacity: number;
    commissionRate: number;
    estimatedDailyRevenue: number;
  }>({
    name: "",
    category: "food",
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
    setSelectedPreset("custom");
    setShowForm(false);
  };

  const removeVendor = (id: string) => {
    onConfigChange({
      ...config,
      vendors: config.vendors.filter((v) => v.id !== id),
    });
  };

  return (
    <EntitySection
      countText={`${config.vendors.length} vendors`}
      addLabel="+ Add Vendor"
      isOpen={showForm}
      onToggle={() => setShowForm(!showForm)}
      formContent={
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Preset
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Load a vendor template, then fine-tune the values.
            </p>
            <select
              value={selectedPreset}
              onChange={(e) => {
                const presetKey = e.target.value;
                setSelectedPreset(presetKey);
                if (presetKey === "custom") {
                  return;
                }
                const preset = VENDOR_PRESETS.find(
                  (item) => item.key === presetKey,
                );
                if (preset) {
                  setFormData(preset.data);
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="custom">Custom Vendor (manual)</option>
              {VENDOR_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Joe's Pizza, Happy Merch"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <p className="text-xs text-slate-600 mb-2">
              What type of vendor is this?
            </p>
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
              <option value="food">🍔 Food & Beverage</option>
              <option value="merchandise">🎁 Merchandise & Souvenirs</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Capacity
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Max people this vendor can serve per day
            </p>
            <input
              type="number"
              placeholder="500"
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
              Commission Rate
            </label>
            <p className="text-xs text-slate-600 mb-2">
              % of their revenue you take (0.15 = 15%)
            </p>
            <input
              type="number"
              placeholder="0.15"
              step="0.01"
              min="0"
              max="1"
              value={formData.commissionRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  commissionRate: parseFloat(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Est. Daily Revenue
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Expected revenue per day ($) before commission
            </p>
            <input
              type="number"
              placeholder="5000"
              value={formData.estimatedDailyRevenue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedDailyRevenue: parseInt(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
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
        </>
      }
    >
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
    </EntitySection>
  );
}
