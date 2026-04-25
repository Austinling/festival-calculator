interface EstimateData {
  capex: number;
  totalOpex: number;
  projectedAttendance: number;
  budgetRemaining: number;
  electricityCost: number;
  recommendations: {
    security: { current: number; recommended: number };
    toilets: { current: number; recommended: number };
    medical: { current: number; recommended: number };
    staff: { current: number; recommended: number };
  };
}

interface BudgetEstimateProps {
  estimate: EstimateData | null;
  budget: number;
  capacity: number;
  onSimulate: () => void;
}

function getStatusTone(current: number, recommended: number) {
  if (current < recommended) {
    return {
      label: "Under",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  if (current === recommended) {
    return {
      label: "On target",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }

  return {
    label: "Above",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  };
}

function RecommendationRow({
  label,
  current,
  recommended,
}: {
  label: string;
  current: number;
  recommended: number;
}) {
  const tone = getStatusTone(current, recommended);

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-[11px] text-slate-600">
          {current} current / {recommended} recommended
        </p>
      </div>
      <span
        className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${tone.className}`}
      >
        {tone.label}
      </span>
    </div>
  );
}

export function BudgetEstimate({
  estimate,
  budget,
  capacity,
  onSimulate,
}: BudgetEstimateProps) {
  if (!estimate) return null;

  const percentBudgetUsed =
    ((budget - estimate.budgetRemaining) / budget) * 100;
  const percentCapacityUsed = (estimate.projectedAttendance / capacity) * 100;
  const budgetStatus = estimate.budgetRemaining >= 0 ? "safe" : "over";

  return (
    <aside className="w-80 space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Capital Costs (CAPEX)
        </h3>
        <p className="text-2xl font-bold text-slate-900">
          ${(estimate.capex / 1000).toFixed(1)}k
        </p>
        <p className="text-xs text-slate-600">Stages, infrastructure, setup</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Operating Costs (OPEX)
        </h3>
        <p className="text-2xl font-bold text-slate-900">
          ${(estimate.totalOpex / 1000).toFixed(1)}k
        </p>
        <p className="text-xs text-slate-600">
          Staff, services, maintenance, electricity
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-700">
          Electricity included: £{estimate.electricityCost.toLocaleString()}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Recommended Resources
        </h3>
        <div className="space-y-2">
          <RecommendationRow
            label="Security"
            current={estimate.recommendations.security.current}
            recommended={estimate.recommendations.security.recommended}
          />
          <RecommendationRow
            label="Toilets"
            current={estimate.recommendations.toilets.current}
            recommended={estimate.recommendations.toilets.recommended}
          />
          <RecommendationRow
            label="Medical"
            current={estimate.recommendations.medical.current}
            recommended={estimate.recommendations.medical.recommended}
          />
          <RecommendationRow
            label="Operations staff"
            current={estimate.recommendations.staff.current}
            recommended={estimate.recommendations.staff.recommended}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Budget Status
        </h3>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all ${
              budgetStatus === "safe" ? "bg-green-500" : "bg-red-500"
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
          {percentCapacityUsed.toFixed(0)}% of {capacity.toLocaleString()}{" "}
          capacity
        </p>
      </div>

      <button
        onClick={onSimulate}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Run Simulation
      </button>
    </aside>
  );
}
