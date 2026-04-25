import type { SimulationResult } from "../../types/festival";

export function ResultsSlide1Turnout({ result }: { result: SimulationResult }) {
  return (
    <div className="space-y-8 text-center">
      <h2 className="text-4xl font-bold text-white">The Turnout</h2>
      <p className="text-xl text-slate-300">
        How many people showed up to your festival?
      </p>

      <div className="space-y-6">
        <div className="rounded-lg bg-slate-700 p-8">
          <p className="mb-2 text-sm uppercase tracking-wider text-slate-400">
            Gate Entry
          </p>
          <p className="text-6xl font-bold text-green-400">
            {result.metrics.projectedAttendance.toLocaleString()}
          </p>
          <p className="mt-4 text-slate-300">
            out of {result.config.festival.capacity.toLocaleString()} capacity
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-700 p-6">
            <p className="text-sm uppercase tracking-wider text-slate-400">
              Peak Day
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              {result.metrics.peakDayAttendance.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-slate-700 p-6">
            <p className="text-sm uppercase tracking-wider text-slate-400">
              Capacity Used
            </p>
            <p className="mt-2 text-3xl font-bold text-purple-400">
              {(
                (result.metrics.projectedAttendance /
                  result.config.festival.capacity) *
                100
              ).toFixed(0)}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
