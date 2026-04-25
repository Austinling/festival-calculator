import type { SimulationResult } from "../../types/festival";

export function ResultsSlide3Financials({
  result,
}: {
  result: SimulationResult;
}) {
  const isProfitable = result.metrics.netProfit > 0;

  return (
    <div className="space-y-8">
      <h2 className="text-center text-4xl font-bold text-white">
        The Financials
      </h2>
      <p className="text-center text-xl text-slate-300">
        Revenue vs. Costs breakdown
      </p>

      {/* Net Profit Card */}
      <div className={`rounded-lg p-8 text-center ${
        isProfitable ? "bg-green-900" : "bg-red-900"
      }`}>
        <p className="text-sm uppercase tracking-wider text-slate-300">
          Net Profit/Loss
        </p>
        <p className={`mt-2 text-5xl font-bold ${
          isProfitable ? "text-green-400" : "text-red-400"
        }`}>
          ${(result.metrics.netProfit / 1000).toFixed(1)}k
        </p>
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-lg bg-slate-700 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Revenue</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Ticket Sales</span>
            <span className="font-semibold text-green-400">
              ${(result.metrics.ticketRevenue / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Vendor Commissions</span>
            <span className="font-semibold text-green-400">
              ${(result.metrics.vendorCommission / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="border-t border-slate-600 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Total Revenue</span>
              <span className="font-bold text-green-300">
                ${(result.metrics.totalRevenue / 1000).toFixed(1)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-lg bg-slate-700 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Costs</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">CAPEX (Capital)</span>
            <span className="font-semibold text-red-400">
              ${(result.metrics.totalCAPEX / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">OPEX (Operating)</span>
            <span className="font-semibold text-red-400">
              ${(result.metrics.totalOPEX / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="border-t border-slate-600 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Total Costs</span>
              <span className="font-bold text-red-300">
                ${((result.metrics.totalCAPEX + result.metrics.totalOPEX) / 1000).toFixed(1)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Break-Even Point */}
      <div className="rounded-lg bg-slate-700 p-6 text-center">
        <p className="text-sm uppercase tracking-wider text-slate-400">
          Break-Even Point
        </p>
        <p className="mt-2 text-3xl font-bold text-yellow-400">
          Day {result.metrics.breakEvenPoint}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          of {result.config.festival.durationDays} days
        </p>
      </div>
    </div>
  );
}
