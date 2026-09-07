type StoichiometryMolarMassBridgeDiagramProps = {
  gramsLabel: string;
  molesLabel: string;
  bridgeLabel: string;
  caption: string;
};

/**
 * A fixed illustration of molar mass's role as the conversion "bridge"
 * between a measurable quantity (grams, read off a scale) and the
 * chemically meaningful quantity (moles, a count of particles) — the two
 * units that mole-ratio stoichiometry constantly moves between.
 */
export default function StoichiometryMolarMassBridgeDiagram({ gramsLabel, molesLabel, bridgeLabel, caption }: StoichiometryMolarMassBridgeDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex items-center justify-center gap-3 overflow-x-auto">
        <div className="flex h-14 w-24 flex-col items-center justify-center rounded-xl border-2 border-zinc-400 bg-zinc-100 text-xs font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
          {gramsLabel}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-zinc-400 dark:text-zinc-500">⇄</span>
          <span className="whitespace-nowrap text-[10px] text-zinc-500 dark:text-zinc-400">{bridgeLabel}</span>
        </div>
        <div className="flex h-14 w-24 flex-col items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-500/10 text-xs font-semibold text-blue-700 dark:text-blue-300">
          {molesLabel}
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
