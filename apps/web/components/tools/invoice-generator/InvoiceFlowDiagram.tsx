import { ChevronRight } from "lucide-react";

type InvoiceFlowDiagramProps = {
  subtotalLabel: string;
  discountLabel: string;
  taxLabel: string;
  totalLabel: string;
};

/** Worked example matching this tool's own "Example 1" figures used elsewhere on the page (the $598 total also appears in the recurring-billing chart). */
const SUBTOTAL = 650;
const DISCOUNT = 130;
const TAXABLE = SUBTOTAL - DISCOUNT;
const TAX = 78;
const TOTAL = TAXABLE + TAX;

function Stop({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-3 py-2.5 text-center ${colorClass}`}>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span dir="ltr" className="font-mono text-xs font-bold">
        {value}
      </span>
    </div>
  );
}

/**
 * Plain HTML sequence of stops joined by chevrons — no bordered boxes with
 * −/+/= operators floating between them, and no single fixed-width SVG
 * ribbon either (that shape's fixed text zones carry the same crowding
 * risk as bordered boxes once a label translates longer). `rtl:rotate-180`
 * on every chevron so the chain still reads start-to-end in Arabic.
 */
export default function InvoiceFlowDiagram({ subtotalLabel, discountLabel, taxLabel, totalLabel }: InvoiceFlowDiagramProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <Stop label={subtotalLabel} value={`$${SUBTOTAL.toFixed(2)}`} colorClass="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" />
      <ChevronRight size={14} className="shrink-0 text-zinc-400 rtl:rotate-180 dark:text-zinc-500" aria-hidden="true" />
      <Stop label={discountLabel} value={`-$${DISCOUNT.toFixed(2)}`} colorClass="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" />
      <ChevronRight size={14} className="shrink-0 text-zinc-400 rtl:rotate-180 dark:text-zinc-500" aria-hidden="true" />
      <Stop label={taxLabel} value={`+$${TAX.toFixed(2)}`} colorClass="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" />
      <ChevronRight size={14} className="shrink-0 text-zinc-400 rtl:rotate-180 dark:text-zinc-500" aria-hidden="true" />
      <Stop label={totalLabel} value={`$${TOTAL.toFixed(2)}`} colorClass="bg-emerald-600 text-white dark:bg-emerald-500" />
    </div>
  );
}
