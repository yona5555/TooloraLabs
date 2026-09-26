type SalesTaxAdditionDiagramProps = {
  subtotalLabel: string;
  taxLabel: string;
  totalLabel: string;
};

// Illustrative: $100 subtotal + 8% tax ($8) = $108 total.
const SUBTOTAL_FRACTION = 100 / 108;

/**
 * Plain HTML stacked bars — no SVG, no boxes-with-arrows. `dir="ltr"`
 * matches every quantitative chart in this codebase (EduBarChart,
 * EduLineChart, EduDonutChart all force it too, in Fuel Cost Calculator
 * and every other tool): a fill's growth direction is a magnitude, the
 * same category as a gauge's numeric ticks, so it stays LTR-computed
 * regardless of page direction.
 *
 * The tax segment's own label never renders *inside* that segment: at an
 * 8%-of-total share the colored sliver is only a few pixels wide, nowhere
 * near enough room for a full label — text forced inside it wrapped to
 * two illegible lines and spilled past the segment's own edges (the exact
 * "text crowding inside a narrow bar" bug class). The label instead lives
 * in a legend row below the bar, at a fixed, always-sufficient width.
 */
export default function SalesTaxAdditionDiagram({ subtotalLabel, taxLabel, totalLabel }: SalesTaxAdditionDiagramProps) {
  const subtotalPct = SUBTOTAL_FRACTION * 100;
  const taxPct = 100 - subtotalPct;

  return (
    <div dir="ltr" className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{subtotalLabel}</p>
        <div className="mt-1 h-9 w-full overflow-hidden rounded-lg bg-blue-600 dark:bg-blue-500" />
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{totalLabel}</p>
        <div className="mt-1 flex h-9 w-full overflow-hidden rounded-lg">
          <div className="bg-blue-600 dark:bg-blue-500" style={{ width: `${subtotalPct}%` }} />
          <div className="bg-amber-500 dark:bg-amber-400" style={{ width: `${taxPct}%` }} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-blue-600 dark:bg-blue-500" />
          <span className="text-zinc-600 dark:text-zinc-300">{subtotalLabel}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-amber-500 dark:bg-amber-400" />
          <span className="text-zinc-600 dark:text-zinc-300">{taxLabel}</span>
        </span>
      </div>
    </div>
  );
}
