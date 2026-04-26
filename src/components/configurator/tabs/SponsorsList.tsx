import { useState } from "react";
import type { FestivalConfig, SponsorDeal } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface SponsorsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const SPONSOR_TIERS = {
  community: { label: "Community Sponsor", profit: 10000 },
  regional: { label: "Regional Sponsor", profit: 100000 },
  headline: { label: "Headline Sponsor", profit: 1000000 },
} as const;

export function SponsorsList({ config, onConfigChange }: SponsorsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    tier: SponsorDeal["tier"];
    profit: number;
  }>({
    name: "",
    tier: "community",
    profit: SPONSOR_TIERS.community.profit,
  });

  const addSponsor = () => {
    if (!formData.name) return;

    const newSponsor: SponsorDeal = {
      id: `sponsor-${Date.now()}`,
      name: formData.name,
      tier: formData.tier,
      profit: formData.profit,
    };

    onConfigChange({
      ...config,
      sponsors: [...config.sponsors, newSponsor],
    });

    setFormData({
      name: "",
      tier: "community",
      profit: SPONSOR_TIERS.community.profit,
    });
    setShowForm(false);
  };

  const removeSponsor = (id: string) => {
    onConfigChange({
      ...config,
      sponsors: config.sponsors.filter((sponsor) => sponsor.id !== id),
    });
  };

  const totalSponsorProfit = config.sponsors.reduce(
    (sum, sponsor) => sum + sponsor.profit,
    0,
  );

  return (
    <EntitySection
      countText={`${config.sponsors.length} sponsor deals • £${totalSponsorProfit.toLocaleString()} total profit`}
      addLabel="+ Add Sponsor"
      isOpen={showForm}
      onToggle={() => setShowForm(!showForm)}
      formContent={
        <>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Sponsor Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Radio One, Brew Co"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Tier
            </label>
            <select
              value={formData.tier}
              onChange={(e) => {
                const tier = e.target.value as keyof typeof SPONSOR_TIERS;
                setFormData({
                  ...formData,
                  tier,
                  profit: SPONSOR_TIERS[tier].profit,
                });
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="community">Community Sponsor</option>
              <option value="regional">Regional Sponsor</option>
              <option value="headline">Headline Sponsor</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Profit Contribution
            </label>
            <p className="mb-2 text-xs text-slate-600">
              Treated as direct festival profit (£) from sponsorship.
            </p>
            <input
              type="number"
              placeholder="5000"
              value={formData.profit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  profit: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addSponsor}
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
      {config.sponsors.map((sponsor) => (
        <div
          key={sponsor.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div>
            <p className="font-medium text-slate-900">{sponsor.name}</p>
            <p className="text-xs text-slate-600">
              {SPONSOR_TIERS[sponsor.tier].label} • £
              {sponsor.profit.toLocaleString()} profit
            </p>
          </div>
          <button
            onClick={() => removeSponsor(sponsor.id)}
            className="text-slate-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </EntitySection>
  );
}
