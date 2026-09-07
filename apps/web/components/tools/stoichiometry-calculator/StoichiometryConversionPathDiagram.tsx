type StoichiometryConversionPathDiagramProps = {
  steps: { label: string; value: string }[];
  caption: string;
};

/**
 * The classic "stoichiometry roadmap": known amount -> known moles -> target
 * moles -> target amount, each arrow being one conversion factor (molar
 * mass, mole ratio, molar mass again). Live — the values are this result's
 * actual computed intermediate numbers, not placeholders.
 */
export default function StoichiometryConversionPathDiagram({ steps, caption }: StoichiometryConversionPathDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex min-w-[84px] flex-col items-center justify-center rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
              <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-100">{step.value}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{step.label}</span>
            </div>
            {i < steps.length - 1 && <span className="text-zinc-400 dark:text-zinc-500">→</span>}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
