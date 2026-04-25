import type { FestivalConfig } from "../../../types/festival";

interface ParkingListProps {
  config: FestivalConfig;
  onConfigChange: (config: FestivalConfig) => void;
}

function getEventSize(stageCount: number): "small" | "medium" | "large" {
  if (stageCount > 5) return "large";
  if (stageCount >= 3) return "medium";
  return "small";
}

const PARKING_FIXED = {
  small: 500,
  medium: 4500,
  large: 40000,
} as const;

const PARKING_VARIABLE = {
  small: 120,
  medium: 1600,
  large: 11000,
} as const;

export function ParkingList({ config, onConfigChange }: ParkingListProps) {
  const parkingAmenity = config.amenities.find(
    (item) => item.type === "parking",
  );
  const eventSize = getEventSize(config.stages.length);

  const enableParking = () => {
    if (parkingAmenity) return;

    onConfigChange({
      ...config,
      amenities: [
        ...config.amenities,
        {
          id: `parking-${Date.now()}`,
          name: "Festival Parking",
          type: "parking",
          setupCost: PARKING_FIXED[eventSize],
          maintenanceCostPerDay: PARKING_VARIABLE[eventSize],
        },
      ],
    });
  };

  const disableParking = () => {
    onConfigChange({
      ...config,
      amenities: config.amenities.filter((item) => item.type !== "parking"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Parking Setup</h3>
        <p className="mt-1 text-xs text-slate-600">
          Parking costs are auto-calculated by event size derived from stage
          count.
        </p>
        <div className="mt-3 space-y-1 text-xs text-slate-700">
          <p>Event size: {eventSize}</p>
          <p>
            Fixed parking cost: £{PARKING_FIXED[eventSize].toLocaleString()}
          </p>
          <p>
            Variable parking cost: £
            {PARKING_VARIABLE[eventSize].toLocaleString()} / day
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          {!parkingAmenity ? (
            <button
              onClick={enableParking}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Enable Parking
            </button>
          ) : (
            <button
              onClick={disableParking}
              className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Remove Parking
            </button>
          )}
        </div>
      </div>

      {parkingAmenity && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">Parking enabled</p>
          <p className="text-xs text-slate-600">
            Uses fixed £{PARKING_FIXED[eventSize].toLocaleString()} + £
            {PARKING_VARIABLE[eventSize].toLocaleString()}/day variable cost.
          </p>
        </div>
      )}
    </div>
  );
}
