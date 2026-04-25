import type { SimulationResult } from "../../types/festival";

export function ResultsSlide2Experience({ result }: { result: SimulationResult }) {
  const getSatisfactionColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getWaitTimeStatus = (minutes: number) => {
    if (minutes <= 15) return "Excellent";
    if (minutes <= 30) return "Acceptable";
    if (minutes <= 45) return "Long";
    return "Critical";
  };

  return (
    <div className="space-y-8">
      <h2 className="text-center text-4xl font-bold text-white">
        The Experience
      </h2>
      <p className="text-center text-xl text-slate-300">
        How did the crowd feel at your festival?
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Crowd Satisfaction */}
        <div className="rounded-lg bg-slate-700 p-6">
          <p className="text-sm uppercase tracking-wider text-slate-400">
            Crowd Satisfaction
          </p>
          <p
            className={`mt-2 text-4xl font-bold ${getSatisfactionColor(
              result.metrics.crowdSatisfaction,
            )}`}
          >
            {result.metrics.crowdSatisfaction.toFixed(0)}/100
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-600">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-green-500"
              style={{
                width: `${result.metrics.crowdSatisfaction}%`,
              }}
            />
          </div>
        </div>

        {/* Safety Rating */}
        <div className="rounded-lg bg-slate-700 p-6">
          <p className="text-sm uppercase tracking-wider text-slate-400">
            Safety Rating
          </p>
          <p className="mt-2 text-4xl font-bold text-blue-400">
            {result.metrics.safetyRating.toFixed(0)}/100
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-600">
            <div
              className="h-full bg-blue-500"
              style={{
                width: `${result.metrics.safetyRating}%`,
              }}
            />
          </div>
        </div>

        {/* Toilet Wait Times */}
        <div className="rounded-lg bg-slate-700 p-6">
          <p className="text-sm uppercase tracking-wider text-slate-400">
            Toilet Wait Time
          </p>
          <p className="mt-2 text-3xl font-bold text-purple-400">
            {result.metrics.toiletWaitTimeMinutes} min
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {getWaitTimeStatus(result.metrics.toiletWaitTimeMinutes)}
          </p>
        </div>

        {/* Security Incidents */}
        <div className="rounded-lg bg-slate-700 p-6">
          <p className="text-sm uppercase tracking-wider text-slate-400">
            Security Incidents
          </p>
          <p className="mt-2 text-3xl font-bold text-orange-400">
            {result.metrics.securityIncidents}
          </p>
          <p className="mt-2 text-sm text-slate-400">incidents reported</p>
        </div>
      </div>

      {/* Verdict */}
      <div className="rounded-lg border border-slate-600 bg-slate-700 p-6 text-center">
        <p className="text-slate-300">{result.metrics.verdict}</p>
      </div>
    </div>
  );
}
