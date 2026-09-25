export type WorkedExampleRow = {
  unitsLabel: string;
  totalCost: string;
  revenue: string;
  statusLabel: string;
  statusKind: "loss" | "breakeven" | "profit";
};

type Props = {
  columnUnits: string;
  columnTotalCost: string;
  columnRevenue: string;
  columnResult: string;
  rows: WorkedExampleRow[];
  caption: string;
};

const STATUS_CLASSES: Record<WorkedExampleRow["statusKind"], string> = {
  loss: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  breakeven: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  profit: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

/**
 * Replaces the old CvpDiagram (two straight lines crossing at one point,
 * with "Total cost"/"Revenue" labels stacked 4px apart at the same
 * right-aligned x position — unreadable overlap, and exactly the banned
 * "line chart with a single point" pattern). A worked-example table shows
 * the same underlying idea — cost and revenue converge toward a crossing
 * point as volume increases — as real computed numbers at four concrete
 * unit counts, using the same $10,000 fixed / $20 variable / $50 price
 * reference scenario already used by this file's other worked examples
 * (BreakEvenTwoScenarioCompareBar's 334 units, BreakEvenRevenueDonut's
 * 10000/10000/5000 split, BreakEvenPriceChangeImpactBar's $50 at 334
 * units) — not a new, disconnected set of numbers.
 */
export default function BreakEvenWorkedExampleTable({ columnUnits, columnTotalCost, columnRevenue, columnResult, rows, caption }: Props) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60">
              <th className="px-3 py-2 text-start font-semibold text-zinc-600 dark:text-zinc-300">{columnUnits}</th>
              <th className="px-3 py-2 text-start font-semibold text-zinc-600 dark:text-zinc-300">{columnTotalCost}</th>
              <th className="px-3 py-2 text-start font-semibold text-zinc-600 dark:text-zinc-300">{columnRevenue}</th>
              <th className="px-3 py-2 text-start font-semibold text-zinc-600 dark:text-zinc-300">{columnResult}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.unitsLabel} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <td className="px-3 py-2.5 font-mono">{row.unitsLabel}</td>
                <td className="px-3 py-2.5 font-mono text-amber-700 dark:text-amber-400">{row.totalCost}</td>
                <td className="px-3 py-2.5 font-mono text-blue-700 dark:text-blue-400">{row.revenue}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[row.statusKind]}`}>{row.statusLabel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
