import { useState } from "react";
import type { FestivalConfig, Artist } from "../../../types/festival";
import { EntitySection } from "../shared/EntitySection";

interface ArtistsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

const ARTIST_PRESETS = [
  {
    key: "justin-bieber",
    label: "Justin Bieber (Pop Headliner)",
    data: {
      name: "Justin Bieber",
      genre: "pop",
      duration: 90,
      startTime: "21:00",
      ticketRevenue: 60,
      drawFactor: 1.9,
    },
  },
  {
    key: "dj-snake",
    label: "DJ Snake (EDM)",
    data: {
      name: "DJ Snake",
      genre: "edm",
      duration: 75,
      startTime: "22:30",
      ticketRevenue: 40,
      drawFactor: 1.6,
    },
  },
  {
    key: "indie-band",
    label: "Indie Band Slot",
    data: {
      name: "The Midnight Signals",
      genre: "indie",
      duration: 60,
      startTime: "18:00",
      ticketRevenue: 20,
      drawFactor: 1.2,
    },
  },
];

export function ArtistsList({ config, onConfigChange }: ArtistsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [formData, setFormData] = useState({
    name: "",
    stageId: config.stages[0]?.id || "",
    genre: "rock",
    duration: 60,
    startTime: "14:00",
    ticketRevenue: 0,
    drawFactor: 1.0,
  });

  const addArtist = () => {
    if (!formData.name || !formData.stageId) return;

    const newArtist: Artist = {
      id: `artist-${Date.now()}`,
      name: formData.name,
      stageId: formData.stageId,
      genre: formData.genre,
      duration: formData.duration,
      startTime: formData.startTime,
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
      genre: "rock",
      duration: 60,
      startTime: "14:00",
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
              Start Time *
            </label>
            <p className="text-xs text-slate-600 mb-2">
              When does their set start? (24-hour format)
            </p>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duration
            </label>
            <p className="text-xs text-slate-600 mb-2">
              How long they perform (minutes)
            </p>
            <input
              type="number"
              placeholder="60"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseInt(e.target.value),
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
                {stage?.name} • {artist.startTime} • {artist.duration} min •
                Draw: {artist.drawFactor}x
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
