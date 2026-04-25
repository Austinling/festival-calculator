import type { FestivalConfig } from "../../../types/festival";

interface WifiListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

function getEventSize(stageCount: number): "small" | "medium" | "large" {
  if (stageCount > 5) return "large";
  if (stageCount >= 3) return "medium";
  return "small";
}

const WIFI_COST = {
  small: 2500,
  medium: 10000,
  large: 100000,
} as const;

export function WifiList({ config, onConfigChange }: WifiListProps) {
  const wifiAmenity = config.amenities.find((item) => item.type === "wifi");
  const eventSize = getEventSize(config.stages.length);

  const enableWifi = () => {
    if (wifiAmenity) return;

    onConfigChange({
      ...config,
      amenities: [
        ...config.amenities,
        {
          id: `wifi-${Date.now()}`,
          name: "Festival WiFi",
          type: "wifi",
          setupCost: WIFI_COST[eventSize],
          maintenanceCostPerDay: 0,
        },
      ],
    });
  };

  const disableWifi = () => {
    onConfigChange({
      ...config,
      amenities: config.amenities.filter((item) => item.type !== "wifi"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Festival WiFi</h3>
        <p className="mt-1 text-xs text-slate-600">
          WiFi cost is automatically based on event size derived from stage
          count.
        </p>
        <div className="mt-3 space-y-1 text-xs text-slate-700">
          <p>Event size: {eventSize}</p>
          <p>WiFi cost: £{WIFI_COST[eventSize].toLocaleString()}</p>
        </div>
        <div className="mt-4 flex gap-2">
          {!wifiAmenity ? (
            <button
              onClick={enableWifi}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Enable WiFi
            </button>
          ) : (
            <button
              onClick={disableWifi}
              className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Remove WiFi
            </button>
          )}
        </div>
      </div>

      {wifiAmenity && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">WiFi enabled</p>
          <p className="text-xs text-slate-600">
            Uses flat £{WIFI_COST[eventSize].toLocaleString()} cost for this
            event size.
          </p>
        </div>
      )}
    </div>
  );
}
