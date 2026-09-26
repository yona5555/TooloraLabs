import BreakEvenWorkedExampleTable from "./BreakEvenWorkedExampleTable";

type MonthPoint = { key: string; label: string; cumulativeUnits: number };

type BreakEvenMonthlyPaceLineChartProps = {
  points: MonthPoint[];
  breakEvenLabel: string;
  columnMonth: string;
  columnCumulativeUnits: string;
  columnPercentOfBreakEven: string;
  caption: string;
};

const BREAK_EVEN_UNITS = 334;

/**
 * Was a line+dot chart (a cyan path through 4 monthly points, each with its
 * own circle marker, against a dashed break-even reference line) — the
 * banned pattern again, just in a different color. A table of the same 4
 * months shows the same "cumulative units climbing toward break-even"
 * story as real percentages instead of a plotted line.
 */
export default function BreakEvenMonthlyPaceLineChart({ points, breakEvenLabel, columnMonth, columnCumulativeUnits, columnPercentOfBreakEven, caption }: BreakEvenMonthlyPaceLineChartProps) {
  const rows = points.map((p) => {
    const percent = Math.round((p.cumulativeUnits / BREAK_EVEN_UNITS) * 100);
    const reachedBreakEven = p.cumulativeUnits >= BREAK_EVEN_UNITS;
    return [p.label, String(p.cumulativeUnits), reachedBreakEven ? { text: breakEvenLabel, kind: "breakeven" as const } : `${percent}%`];
  });

  return <BreakEvenWorkedExampleTable columns={[columnMonth, columnCumulativeUnits, columnPercentOfBreakEven]} rows={rows} caption={caption} />;
}
