import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real retail convention: discount is applied to the price first, then sales tax is computed on the discounted amount, not the original. */
const PRICE = 120;
const DISCOUNT_PERCENT = 25;
const AFTER_DISCOUNT = PRICE * (1 - DISCOUNT_PERCENT / 100);
const TAX_PERCENT = 8;
const FINAL_WITH_TAX = AFTER_DISCOUNT * (1 + TAX_PERCENT / 100);

export default async function DiscountTaxAfterDiscountDiagram() {
  const t = await getTranslations("tools.discount-calculator.taxAfterDiscountDiagram");

  const steps = [
    { label: t("original"), value: `$${PRICE.toFixed(2)}` },
    { label: t("afterDiscount", { percent: DISCOUNT_PERCENT }), value: `$${AFTER_DISCOUNT.toFixed(2)}` },
    { label: t("afterTax", { percent: TAX_PERCENT }), value: `$${FINAL_WITH_TAX.toFixed(2)}` },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={380} height={steps.length * 40 + 12} viewBox={`0 0 380 ${steps.length * 40 + 12}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[320px] text-current">
          {steps.map((step, i) => (
            <g key={step.label} transform={`translate(0, ${i * 40})`}>
              <rect x={0} y={0} width={380} height={32} rx={6} className={i === steps.length - 1 ? "fill-emerald-50 stroke-emerald-400 dark:fill-emerald-500/10 dark:stroke-emerald-400/50" : "fill-current opacity-[0.04]"} strokeWidth={i === steps.length - 1 ? 1.5 : 0} />
              <text x={12} y={21} fontSize={11} fill="currentColor" opacity={0.8}>
                {step.label}
              </text>
              <text x={368} y={21} textAnchor="end" fontSize={13} fontWeight={700} className={i === steps.length - 1 ? "fill-emerald-700 dark:fill-emerald-300" : "fill-current"}>
                {step.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </SectionCard>
  );
}
