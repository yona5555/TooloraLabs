type SalesTaxVsVatFlowDiagramProps = {
  salesTaxLabel: string;
  vatLabel: string;
  stageLabel: string;
  taxHereLabel: string;
  noTaxLabel: string;
};

const STAGE_COUNT = 3;

type StageRowProps = {
  label: string;
  colorClass: string;
  dotColorClass: string;
  lineColorClass: string;
  stageLabel: string;
  taxHereLabel: string;
  noTaxLabel: string;
  taxAt: (stage: number) => boolean;
};

function StageRow({ label, colorClass, dotColorClass, lineColorClass, stageLabel, taxHereLabel, noTaxLabel, taxAt }: StageRowProps) {
  return (
    <div>
      <p className={`text-xs font-bold ${colorClass}`}>{label}</p>
      <div className="mt-2 flex items-center">
        {Array.from({ length: STAGE_COUNT }, (_, i) => (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <div className="flex shrink-0 flex-col items-center gap-1 text-center">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${taxAt(i) ? dotColorClass : "bg-zinc-300 dark:bg-zinc-600"}`}>{i + 1}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {stageLabel} {i + 1}
              </span>
              <span className={`text-[10px] font-bold ${taxAt(i) ? colorClass : "text-zinc-400 dark:text-zinc-500"}`}>{taxAt(i) ? taxHereLabel : noTaxLabel}</span>
            </div>
            {i < STAGE_COUNT - 1 && <span className={`mx-1 h-0.5 flex-1 rounded ${lineColorClass}`} aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Plain HTML row of numbered stage badges connected by a bare CSS line —
 * no bordered boxes, no arrow glyphs. Previously three SVG <rect> stages
 * per row linked by "→"/"←" text — the exact banned "boxes connected by an
 * arrow" pattern, forced into `dir="ltr"` so the stage order never
 * actually flipped on the Arabic page despite the isRtl prop it carried.
 * A plain HTML flex row has no such problem: it reverses on its own under
 * `dir="rtl"`, the same way BreakEvenBusinessTypeDiagram already does with
 * zero direction-handling code, so this component carries none either.
 */
export default function SalesTaxVsVatFlowDiagram({ salesTaxLabel, vatLabel, stageLabel, taxHereLabel, noTaxLabel }: SalesTaxVsVatFlowDiagramProps) {
  return (
    <div className="space-y-5">
      <StageRow
        label={salesTaxLabel}
        colorClass="text-indigo-600 dark:text-indigo-400"
        dotColorClass="bg-indigo-600 dark:bg-indigo-400"
        lineColorClass="bg-indigo-200 dark:bg-indigo-500/30"
        stageLabel={stageLabel}
        taxHereLabel={taxHereLabel}
        noTaxLabel={noTaxLabel}
        taxAt={(i) => i === STAGE_COUNT - 1}
      />
      <StageRow
        label={vatLabel}
        colorClass="text-rose-600 dark:text-rose-400"
        dotColorClass="bg-rose-500 dark:bg-rose-400"
        lineColorClass="bg-rose-200 dark:bg-rose-500/30"
        stageLabel={stageLabel}
        taxHereLabel={taxHereLabel}
        noTaxLabel={noTaxLabel}
        taxAt={() => true}
      />
    </div>
  );
}
