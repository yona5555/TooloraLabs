import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Worked example of the tool's own formula: quantity * unit price -> subtotal -> + tax -> total. Real numbers, not placeholders. */
const QTY = 12;
const UNIT_PRICE = 85;
const LINE_TOTAL = QTY * UNIT_PRICE;
const SUBTOTAL = LINE_TOTAL + 73.5;
const TAX_PERCENT = 8.5;
const TAX = SUBTOTAL * (TAX_PERCENT / 100);
const TOTAL = SUBTOTAL + TAX;

export default async function InvoiceFormulaDiagram() {
  const t = await getTranslations("tools.batch-invoice-calculator.formulaDiagram");

  const rows = [
    { label: t("lineTotal", { qty: QTY, price: UNIT_PRICE.toFixed(2) }), value: `$${LINE_TOTAL.toFixed(2)}` },
    { label: t("subtotal"), value: `$${SUBTOTAL.toFixed(2)}` },
    { label: t("tax", { percent: TAX_PERCENT }), value: `$${TAX.toFixed(2)}` },
    { label: t("total"), value: `$${TOTAL.toFixed(2)}`, highlight: true },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={380} height={rows.length * 40 + 12} viewBox={`0 0 380 ${rows.length * 40 + 12}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[320px] text-current">
          {rows.map((row, i) => (
            <g key={row.label} transform={`translate(0, ${i * 40})`}>
              <rect x={0} y={0} width={380} height={32} rx={6} className={row.highlight ? "fill-emerald-50 stroke-emerald-400 dark:fill-emerald-500/10 dark:stroke-emerald-400/50" : "fill-current opacity-[0.04]"} strokeWidth={row.highlight ? 1.5 : 0} />
              <text x={12} y={21} fontSize={11} fill="currentColor" opacity={0.8}>
                {row.label}
              </text>
              <text x={368} y={21} textAnchor="end" fontSize={13} fontWeight={700} className={row.highlight ? "fill-emerald-700 dark:fill-emerald-300" : "fill-current"}>
                {row.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </SectionCard>
  );
}
