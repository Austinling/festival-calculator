import { useState } from "react";
import type { FestivalConfig, Artist } from "../../../types/festival";

interface ArtistsListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

export function ArtistsList({ config, onConfigChange }: ArtistsListProps) {
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(false);
  };

  const removeArtist = (id: string) => {
    onConfigChange({
      ...config,
      artists: config.artists.filter((a) => a.id !== id),
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-600">{config.artists.length} artists</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Artist
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            type="text"
            placeholder="Artist name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
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
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration}
            onChange={(e) =>
              setFormData({
                ...formData,
                duration: parseInt(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Draw Factor (0.5 - 2.0)"
            step="0.1"
            value={formData.drawFactor}
            onChange={(e) =>
              setFormData({
                ...formData,
                drawFactor: parseFloat(e.target.value),
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
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
        </div>
      )}

      <div className="space-y-2">
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
      </div>
    </div>
  );
}
