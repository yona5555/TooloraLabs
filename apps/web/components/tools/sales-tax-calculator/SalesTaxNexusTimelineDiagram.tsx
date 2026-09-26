type SalesTaxNexusTimelineDiagramProps = {
  quillLabel: string;
  quillYear: string;
  wayfairLabel: string;
  wayfairYear: string;
  physicalLabel: string;
  economicLabel: string;
};

/**
 * Plain HTML dots-on-a-line timeline — no SVG, no fixed-width text that
 * can clip. Previously an SVG timeline whose "economic nexus" label (a
 * full sentence) ran past the fixed viewBox and was visibly cut off; real
 * HTML text simply wraps within its own column at any width, in any
 * locale, so that whole bug class cannot recur here.
 */
export default function SalesTaxNexusTimelineDiagram({ quillLabel, quillYear, wayfairLabel, wayfairYear, physicalLabel, economicLabel }: SalesTaxNexusTimelineDiagramProps) {
  return (
    <div dir="ltr" className="w-full">
      <div className="flex items-center">
        <span className="h-3 w-3 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        <span className="mx-1 h-0.5 flex-1 rounded bg-gradient-to-r from-zinc-300 to-fuchsia-400 dark:from-zinc-600 dark:to-fuchsia-500" aria-hidden="true" />
        <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400" />
      </div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="max-w-[48%]">
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">{quillYear}</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{quillLabel}</p>
          <p className="mt-0.5 text-xs font-bold text-zinc-700 dark:text-zinc-200">{physicalLabel}</p>
        </div>
        <div className="max-w-[48%] text-end">
          <p className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400">{wayfairYear}</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{wayfairLabel}</p>
          <p className="mt-0.5 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">{economicLabel}</p>
        </div>
      </div>
    </div>
  );
}
