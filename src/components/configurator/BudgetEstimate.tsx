interface EstimateData {
  capex: number;
  totalOpex: number;
  projectedAttendance: number;
  budgetRemaining: number;
}

interface BudgetEstimateProps {
  estimate: EstimateData | null;
  budget: number;
  capacity: number;
  onSimulate: () => void;
}

export function BudgetEstimate({
  estimate,
  budget,
  capacity,
  onSimulate,
}: BudgetEstimateProps) {
  if (!estimate) return null;

  const percentBudgetUsed = ((budget - estimate.budgetRemaining) / budget) * 100;
  const percentCapacityUsed =
    (estimate.projectedAttendance / capacity) * 100;
  const budgetStatus = estimate.budgetRemaining >= 0 ? "safe" : "over";

  return (
    <aside className="w-80 space-y-4">
      {/* CAPEX Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Capital Costs (CAPEX)
        </h3>
        <p className="text-2xl font-bold text-slate-900">
          ${(estimate.capex / 1000).toFixed(1)}k
        </p>
        <p className="text-xs text-slate-600">Stages, Infrastructure, Setup</p>
      </div>

      {/* OPEX Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Operating Costs (OPEX)
        </h3>
        <p className="text-2xl font-bold text-slate-900">
          ${(estimate.totalOpex / 1000).toFixed(1)}k
        </p>
        <p className="text-xs text-slate-600">Staff, Services, Maintenance</p>
      </div>

      {/* Budget Progress */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Budget Status
        </h3>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all ${
              budgetStatus === "safe"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(percentBudgetUsed, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-600">
          ${estimate.budgetRemaining.toLocaleString()} remaining
        </p>
        <p
          className={`text-xs font-semibold ${
            budgetStatus === "safe" ? "text-green-600" : "text-red-600"
          }`}
        >
          {percentBudgetUsed.toFixed(0)}% used
        </p>
      </div>

      {/* Capacity Progress */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Expected Turnout
        </h3>
        <p className="text-2xl font-bold text-slate-900">
          {estimate.projectedAttendance.toLocaleString()}
        </p>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(percentCapacityUsed, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-600">
          {percentCapacityUsed.toFixed(0)}% of {capacity.toLocaleString()} capacity
        </p>
      </div>

      {/* Simulate Button */}
      <button
        onClick={onSimulate}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Run Simulation
      </button>
    </aside>
  );
}
