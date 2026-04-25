import type { SimulationResult } from "../../types/festival";

const GRADE_COLORS = {
  "A+": "text-green-400 bg-green-900",
  A: "text-green-400 bg-green-900",
  "B+": "text-blue-400 bg-blue-900",
  B: "text-blue-400 bg-blue-900",
  C: "text-yellow-400 bg-yellow-900",
  D: "text-orange-400 bg-orange-900",
  F: "text-red-400 bg-red-900",
} as const;

export function ResultsSlide4Verdict({
  result,
  onBack,
}: {
  result: SimulationResult;
  onBack: () => void;
}) {
  const gradeColor = GRADE_COLORS[result.metrics.grade];

  const handleExport = () => {
    const exportData = {
      festival: result.config.festival,
      metrics: result.metrics,
      timestamp: result.timestamp,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `festival-results-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-center text-4xl font-bold text-white">
        The Verdict
      </h2>

      {/* Grade */}
      <div className={`rounded-lg p-12 text-center ${gradeColor}`}>
        <p className="text-sm uppercase tracking-wider opacity-75">Grade</p>
        <p className="mt-2 text-7xl font-bold">{result.metrics.grade}</p>
        <p className="mt-4 text-lg">{result.metrics.verdict}</p>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-700 p-4 text-center">
          <p className="text-xs uppercase text-slate-400">Attendance</p>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {result.metrics.projectedAttendance.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-slate-700 p-4 text-center">
          <p className="text-xs uppercase text-slate-400">Profit</p>
          <p className={`mt-2 text-2xl font-bold ${
            result.metrics.netProfit > 0 ? "text-green-400" : "text-red-400"
          }`}>
            ${(result.metrics.netProfit / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="rounded-lg bg-slate-700 p-4 text-center">
          <p className="text-xs uppercase text-slate-400">Satisfaction</p>
          <p className="mt-2 text-2xl font-bold text-purple-400">
            {result.metrics.crowdSatisfaction.toFixed(0)}/100
          </p>
        </div>
      </div>

      {/* Operations Summary */}
      <div className="rounded-lg bg-slate-700 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Operations Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Energy Usage</p>
            <p className="mt-1 font-semibold text-white">
              {result.metrics.energyUsage.toLocaleString()} kWh
            </p>
          </div>
          <div>
            <p className="text-slate-400">Waste Generated</p>
            <p className="mt-1 font-semibold text-white">
              {result.metrics.wasteGenerated} tonnes
            </p>
          </div>
          <div>
            <p className="text-slate-400">Staff Required</p>
            <p className="mt-1 font-semibold text-white">
              {result.metrics.staffRequiredPerDay} per day
            </p>
          </div>
          <div>
            <p className="text-slate-400">Safety Rating</p>
            <p className="mt-1 font-semibold text-white">
              {result.metrics.safetyRating.toFixed(0)}/100
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleExport}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Export Results
        </button>
        <button
          onClick={onBack}
          className="flex-1 rounded-lg bg-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-600"
        >
          Try Another Setup
        </button>
      </div>
    </div>
  );
}
