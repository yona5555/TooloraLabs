type SalesTaxNoTaxStatesDiagramProps = {
  states: string[];
  noTaxLabel: string;
  typicalLabel: string;
};

/** Plain HTML wrapping chips — no fixed-width SVG rects, no overflow risk for longer translated labels. */
export default function SalesTaxNoTaxStatesDiagram({ states, noTaxLabel, typicalLabel }: SalesTaxNoTaxStatesDiagramProps) {
  return (
    <div>
      <p className="text-center text-xs font-bold text-cyan-600 dark:text-cyan-400">{noTaxLabel} — 0%</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {states.map((state) => (
          <span key={state} className="rounded-full border-2 border-cyan-500 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700 dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-300">
            {state}
          </span>
        ))}
      </div>
      {/* Magnitude scale (0% -> typical range), same category as a gauge's numeric ticks — dir="ltr" so the gradient direction always matches the "0%" / "typical" text order regardless of page language. */}
      <div dir="ltr" className="mt-4 flex items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500 dark:bg-cyan-400" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">0%</span>
        <span className="mx-1 h-0.5 flex-1 rounded bg-gradient-to-r from-cyan-300 to-amber-400 dark:from-cyan-500/40 dark:to-amber-400/60" aria-hidden="true" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{typicalLabel} 7–10%</span>
      </div>
    </div>
  );
}
