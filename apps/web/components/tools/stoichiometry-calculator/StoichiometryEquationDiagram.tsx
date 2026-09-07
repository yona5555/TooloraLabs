type StoichiometryEquationDiagramProps = {
  knownCoefficient: string;
  knownFormula: string;
  targetCoefficient: string;
  targetFormula: string;
  caption: string;
};

/**
 * A live view of the mole-ratio bridge between the two substances — the
 * coefficients and formulas update as the visitor types, before any
 * calculation happens, since the ratio itself is what the whole
 * calculation is built from.
 */
export default function StoichiometryEquationDiagram({ knownCoefficient, knownFormula, targetCoefficient, targetFormula, caption }: StoichiometryEquationDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex items-center justify-center gap-3 overflow-x-auto">
        <div className="flex h-16 min-w-[90px] flex-col items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-500/10 px-3 font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
          <span>{knownCoefficient || "1"}</span>
          <span>{knownFormula || "?"}</span>
        </div>
        <span className="text-lg text-zinc-400 dark:text-zinc-500">⇌</span>
        <div className="flex h-16 min-w-[90px] flex-col items-center justify-center rounded-xl border-2 border-emerald-500 bg-emerald-500/10 px-3 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">
          <span>{targetCoefficient || "1"}</span>
          <span>{targetFormula || "?"}</span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
