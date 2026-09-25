import BreakEvenWorkedExampleTable from "./BreakEvenWorkedExampleTable";

type BreakEvenFixedCostAccumulationDiagramProps = {
  columnUnits: string;
  columnCumulativeMargin: string;
  columnResult: string;
  breakEvenLabel: string;
  caption: string;
};

const FIXED_COST = 10000;
const MARGIN_PER_UNIT = 30;
const BREAK_EVEN_UNITS = 334;
const SAMPLE_UNITS = [0, 100, 200, BREAK_EVEN_UNITS];

/**
 * Was a line+dot chart (a path through 4 points, each marked with a
 * circle, plus a dashed fixed-cost reference line) — the exact banned
 * pattern. A table of the same 4 sample points showing cumulative
 * contribution margin against the $10,000 fixed-cost target makes the same
 * "margin accumulates until it covers fixed costs" point with real rows
 * instead of a plotted line.
 */
export default function BreakEvenFixedCostAccumulationDiagram({ columnUnits, columnCumulativeMargin, columnResult, breakEvenLabel, caption }: BreakEvenFixedCostAccumulationDiagramProps) {
  const rows = SAMPLE_UNITS.map((units) => {
    const cumulative = units * MARGIN_PER_UNIT;
    const remaining = FIXED_COST - cumulative;
    const resultText = units >= BREAK_EVEN_UNITS ? breakEvenLabel : `$${remaining.toLocaleString("en-US")}`;
    return [String(units), `$${cumulative.toLocaleString("en-US")}`, units >= BREAK_EVEN_UNITS ? { text: resultText, kind: "breakeven" as const } : resultText];
  });

  return <BreakEvenWorkedExampleTable columns={[columnUnits, columnCumulativeMargin, columnResult]} rows={rows} caption={caption} />;
}
