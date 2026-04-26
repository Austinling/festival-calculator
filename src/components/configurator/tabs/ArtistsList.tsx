import { useState } from "react";
import type { FestivalConfig, Artist } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface ArtistsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const ARTIST_PRESETS = [
  {
    key: "global-superstar",
    label: "Global Superstar (The Crowd Magnet)",
    data: {
      name: "Superstar Act",
      genre: "pop",
      setCost: 4000000, // Extremely expensive
      ticketRevenue: 80,
      drawFactor: 2, // Will fill almost any capacity
    },
  },
  {
    key: "mid-tier-pro",
    label: "Reliable Touring Act (The Workhorse)",
    data: {
      name: "Mid-Tier Band",
      genre: "rock",
      setCost: 150000,
      ticketRevenue: 30,
      drawFactor: 1.2, // Solid draw for a fair price
    },
  },
  {
    key: "local-talent",
    label: "Local Opener (Budget Saver)",
    data: {
      name: "Local Artist",
      genre: "various",
      setCost: 500, // Practically free
      ticketRevenue: 5,
      drawFactor: 0.4, // Tiny draw, but no risk
    },
  },
  {
    key: "viral-sensation",
    label: "Viral Newcomer (High Hype)",
    data: {
      name: "Viral Act",
      genre: "pop",
      setCost: 40000,
      ticketRevenue: 20,
      drawFactor: 1.6, // Great "bang for your buck" draw
    },
  },
];

function getAutoStartTime(slotIndex: number): string {
  const baseMinutes = 12 * 60; // 12:00
  const totalMinutes = baseMinutes + slotIndex * 45;
  const hours = Math.floor((totalMinutes / 60) % 24);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

export function ArtistsList({ config, onConfigChange }: ArtistsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState({
    name: "",
    stageId: config.stages[0]?.id || "",
    performanceDay: 1,
    genre: "rock",
    setCost: 2500,
    ticketRevenue: 0,
    drawFactor: 1.0,
  });

  const addArtist = () => {
    if (!formData.name || !formData.stageId) return;

    const newArtist: Artist = {
      id: `artist-${Date.now()}`,
      name: formData.name,
      stageId: formData.stageId,
      performanceDay: formData.performanceDay,
      genre: formData.genre,
      duration: 45,
      startTime: getAutoStartTime(config.artists.length),
      setCost: formData.setCost,
      ticketRevenue: formData.ticketRevenue,
      drawFactor: formData.drawFactor,
    };

    onConfigChange({
      ...config,
      artists: [...config.artists, newArtist],
    });

    setFormData({
      name: "",
      stageId: config.stages[0]?.id || "",
      performanceDay: 1,
      genre: "rock",
      setCost: 2500,
      ticketRevenue: 0,
      drawFactor: 1.0,
    });
    setSelectedPreset("custom");
    setShowForm(false);
  };

  const removeArtist = (id: string) => {
    onConfigChange({
      ...config,
      artists: config.artists.filter((a) => a.id !== id),
    });
  };

  return (
    <EntitySection
      countText={`${config.artists.length} artists`}
      addLabel="+ Add Artist"
      isOpen={showForm}
      onToggle={() => setShowForm(!showForm)}
      formContent={
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Preset
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Pick a predefined artist profile, then edit any field.
            </p>
            <select
              value={selectedPreset}
              onChange={(e) => {
                const presetKey = e.target.value;
                setSelectedPreset(presetKey);
                if (presetKey === "custom") {
                  return;
                }
                const preset = ARTIST_PRESETS.find(
                  (item) => item.key === presetKey,
                );
                if (preset) {
                  setFormData({
                    ...formData,
                    ...preset.data,
                  });
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="custom">Custom Artist (manual)</option>
              {ARTIST_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Artist Name *
            </label>
            <input
              type="text"
              placeholder="e.g., The Beatles, DJ Cool"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stage *
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Which stage will they perform on?
            </p>
            <select
              value={formData.stageId}
              onChange={(e) =>
                setFormData({ ...formData, stageId: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {config.stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            {config.stages.length === 0 && (
              <p className="mt-2 text-xs text-red-600">
                Add at least one stage before creating artists.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Performance Day
            </label>
            <select
              value={formData.performanceDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  performanceDay: Number(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {Array.from(
                { length: Math.max(config.festival.durationDays, 1) },
                (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Day {index + 1}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Genre
            </label>
            <input
              type="text"
              placeholder="e.g., pop, edm, rock"
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Set Duration
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Set duration is fixed at 45 minutes.
            </p>
            <div className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700">
              45 minutes (fixed)
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cost Per Set
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Cost for one 45-minute set (£)
            </p>
            <input
              type="number"
              placeholder="2500"
              value={formData.setCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  setCost: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Draw Factor
            </label>
            <p className="text-xs text-slate-600 mb-2">
              How much they attract attendees (1.0 = average, 2.0 = huge draw,
              0.5 = niche)
            </p>
            <input
              type="number"
              placeholder="1.0"
              step="0.1"
              min="0.5"
              max="2.0"
              value={formData.drawFactor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  drawFactor: parseFloat(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ticket Revenue Impact
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Additional ticket revenue impact per attendee ($)
            </p>
            <input
              type="number"
              placeholder="60"
              value={formData.ticketRevenue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ticketRevenue: parseFloat(e.target.value),
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addArtist}
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
      {config.artists.map((artist) => {
        const stage = config.stages.find((s) => s.id === artist.stageId);
        return (
          <div
            key={artist.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div>
              <p className="font-medium text-slate-900">{artist.name}</p>
              <p className="text-xs text-slate-600">
                Day {artist.performanceDay ?? 1} • {stage?.name} •{" "}
                {artist.startTime} • 45 min • Draw: {artist.drawFactor}x • £
                {artist.setCost.toLocaleString()} / set
              </p>
            </div>
            <button
              onClick={() => removeArtist(artist.id)}
              className="text-slate-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        );
      })}
    </EntitySection>
  );
}
