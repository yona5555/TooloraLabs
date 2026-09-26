import { ChevronRight } from "lucide-react";

type SalesTaxAddVsReverseModeDiagramProps = {
  addModeLabel: string;
  reverseModeLabel: string;
  priceLabel: string;
  totalLabel: string;
};

const PRICE = 100;
const RATE = 0.08;
const TOTAL = PRICE * (1 + RATE);

function MiniBox({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-3 text-center ${colorClass}`}>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span dir="ltr" className="font-mono text-sm font-bold">
        {value}
      </span>
    </div>
  );
}

/**
 * Plain HTML: two small boxes joined by a single chevron icon — the exact
 * hierarchical pattern FuelFlowDiagram already established as the fix for
 * "boxes connected by an operator/arrow," ported here in place of the
 * previous two rows of bordered SVG boxes linked by ×(1+r)/÷(1+r) text and
 * arrow glyphs.
 */
export default function SalesTaxAddVsReverseModeDiagram({ addModeLabel, reverseModeLabel, priceLabel, totalLabel }: SalesTaxAddVsReverseModeDiagramProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">{addModeLabel}</p>
        <div className="flex items-center gap-2">
          <MiniBox label={priceLabel} value={`$${PRICE.toFixed(2)}`} colorClass="bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300" />
          <ChevronRight size={16} className="shrink-0 rtl:rotate-180 text-teal-400 dark:text-teal-500" aria-hidden="true" />
          <MiniBox label={totalLabel} value={`$${TOTAL.toFixed(2)}`} colorClass="bg-teal-600 text-white dark:bg-teal-500" />
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">{reverseModeLabel}</p>
        <div className="flex items-center gap-2">
          <MiniBox label={totalLabel} value={`$${TOTAL.toFixed(2)}`} colorClass="bg-sky-600 text-white dark:bg-sky-500" />
          <ChevronRight size={16} className="shrink-0 rtl:rotate-180 text-sky-400 dark:text-sky-500" aria-hidden="true" />
          <MiniBox label={priceLabel} value={`$${PRICE.toFixed(2)}`} colorClass="bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" />
        </div>
      </div>
    </div>
  );
}
