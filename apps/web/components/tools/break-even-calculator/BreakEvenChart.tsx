import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import BreakEvenWorkedExampleTable, { type WorkedExampleRow } from "./BreakEvenWorkedExampleTable";

type BreakEvenChartProps = {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  breakEvenUnits: number;
  /** When set (target-profit mode), the table's last row uses this instead of a generic "beyond break-even" point. */
  targetProfitUnits?: number;
  digitStyle: DigitStyle;
  columnUnits: string;
  columnTotalCost: string;
  columnRevenue: string;
  columnResult: string;
  statusLossLabel: string;
  statusBreakEvenLabel: string;
  statusProfitLabel: string;
  caption: string;
};

/**
 * Was a line chart: an amber "total cost" line and a blue "revenue" line
 * crossing at one point, with a hover tooltip — the banned pattern, sitting
 * above the fold in the main result panel where it's the single most
 * visible chart on the page. Replaced with a table of the same live inputs
 * at four real unit counts (0, half of break-even, break-even itself, and
 * either the user's target-profit point or 1.5x break-even), each row's
 * total cost and revenue computed the exact same way the calculator itself
 * computes them — real numbers from the user's own typed inputs, not a
 * static illustrative scenario.
 */
export default function BreakEvenChart({
  fixedCosts,
  variableCostPerUnit,
  pricePerUnit,
  breakEvenUnits,
  targetProfitUnits = 0,
  digitStyle,
  columnUnits,
  columnTotalCost,
  columnRevenue,
  columnResult,
  statusLossLabel,
  statusBreakEvenLabel,
  statusProfitLabel,
  caption,
}: BreakEvenChartProps) {
  const currency = (value: number) => {
    const useCompact = Math.abs(value) >= 100_000;
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: useCompact ? 1 : 0,
    });
  };
  const units = (value: number) => formatLocalizedNumber(Math.round(value), digitStyle, { maximumFractionDigits: 0 });

  const beUnits = Math.max(Math.round(breakEvenUnits), 0);
  const lastUnits = targetProfitUnits > 0 ? Math.round(targetProfitUnits) : Math.round(beUnits * 1.5);
  const sampleUnits = [0, Math.round(beUnits / 2), beUnits, lastUnits];

  const rows: WorkedExampleRow[] = sampleUnits.map((u) => {
    const totalCost = fixedCosts + variableCostPerUnit * u;
    const revenue = pricePerUnit * u;
    const diff = revenue - totalCost;
    const tolerance = Math.max(pricePerUnit, 1);
    const status = Math.abs(diff) <= tolerance ? { text: statusBreakEvenLabel, kind: "breakeven" as const } : diff > 0 ? { text: statusProfitLabel, kind: "profit" as const } : { text: statusLossLabel, kind: "loss" as const };
    return [units(u), currency(totalCost), currency(revenue), status];
  });

  return <BreakEvenWorkedExampleTable columns={[columnUnits, columnTotalCost, columnRevenue, columnResult]} rows={rows} caption={caption} />;
}
