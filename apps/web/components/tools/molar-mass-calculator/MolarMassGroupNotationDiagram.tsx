type MolarMassGroupNotationDiagramProps = {
  caption: string;
};

/**
 * A fixed illustration of how a parenthesized group multiplier
 * distributes: Ca(OH)2 means the OH group's atoms are each counted twice,
 * not just the group as a single unit — the same recursive-group logic
 * the parser applies to nested and hydrate notation.
 */
export default function MolarMassGroupNotationDiagram({ caption }: MolarMassGroupNotationDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex items-center justify-center gap-2 overflow-x-auto font-mono text-sm">
        <span className="rounded-lg border-2 border-zinc-400 bg-zinc-100 px-2 py-1.5 font-bold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">Ca</span>
        <span className="rounded-lg border-2 border-blue-500 bg-blue-500/10 px-2 py-1.5 font-bold text-blue-700 dark:text-blue-300">(OH)</span>
        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">×2</span>
        <span className="text-zinc-400 dark:text-zinc-500">=</span>
        <span className="rounded-lg border-2 border-zinc-400 bg-zinc-100 px-2 py-1.5 font-bold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">Ca</span>
        <span className="rounded-lg border-2 border-emerald-500 bg-emerald-500/10 px-2 py-1.5 font-bold text-emerald-700 dark:text-emerald-300">O₂H₂</span>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
