import { ChevronRight } from "lucide-react";

type InventoryRawMaterialsFlowDiagramProps = {
  rawLabel: string;
  logicLabel: string;
  finishedLabel: string;
  caption: string;
};

/**
 * Plain HTML three-step chain — the box+chevron+box pattern from
 * FuelFlowDiagram, extended by one more chevron and box instead of SVG
 * boxes joined by a "→" text glyph. `rtl:rotate-180` on both chevrons so
 * the chain still reads start-to-end on an Arabic page.
 */
export default function InventoryRawMaterialsFlowDiagram({ rawLabel, logicLabel, finishedLabel, caption }: InventoryRawMaterialsFlowDiagramProps) {
  return (
    <figure className="my-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="rounded-xl bg-fuchsia-50 px-4 py-3 text-center text-xs font-semibold text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">{rawLabel}</div>
        <ChevronRight size={16} className="shrink-0 text-fuchsia-400 rtl:rotate-180 dark:text-fuchsia-500" aria-hidden="true" />
        <div className="rounded-xl bg-fuchsia-500 px-4 py-3 text-center text-xs font-semibold text-white dark:bg-fuchsia-400">{logicLabel}</div>
        <ChevronRight size={16} className="shrink-0 text-fuchsia-400 rtl:rotate-180 dark:text-fuchsia-500" aria-hidden="true" />
        <div className="rounded-xl bg-fuchsia-50 px-4 py-3 text-center text-xs font-semibold text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">{finishedLabel}</div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
