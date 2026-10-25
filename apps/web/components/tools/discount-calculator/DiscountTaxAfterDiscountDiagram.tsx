"use client";
import { useTranslations } from "next-intl";
import { useMeasuredWidth } from "@/components/tool-ui/useMeasuredWidth";
import SectionCard from "@/components/tool-ui/SectionCard";
import { svgPx } from "@/components/tool-ui/svgPx";

/** Real retail convention: discount is applied to the price first, then sales tax is computed on the discounted amount, not the original. */
const PRICE = 120;
const DISCOUNT_PERCENT = 25;
const AFTER_DISCOUNT = PRICE * (1 - DISCOUNT_PERCENT / 100);
const TAX_PERCENT = 8;
const FINAL_WITH_TAX = AFTER_DISCOUNT * (1 + TAX_PERCENT / 100);

export default function DiscountTaxAfterDiscountDiagram() {
  const t = useTranslations("tools.discount-calculator.taxAfterDiscountDiagram");
  // Drawn at the card's real width so the rows fill it while the text keeps its true size.
  const [wrap, W] = useMeasuredWidth(380, 320);

  const steps = [
    { label: t("original"), value: `$${PRICE.toFixed(2)}` },
    { label: t("afterDiscount", { percent: DISCOUNT_PERCENT }), value: `$${AFTER_DISCOUNT.toFixed(2)}` },
    { label: t("afterTax", { percent: TAX_PERCENT }), value: `$${FINAL_WITH_TAX.toFixed(2)}` },
  ];

  return (
    <SectionCard phoneRole="visual" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div ref={wrap} dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={W} height={steps.length * 40 + 12} viewBox={`0 0 ${W} ${steps.length * 40 + 12}`} role="img" aria-label={t("title")} className="block min-w-[320px] text-current">
          {steps.map((step, i) => (
            <g key={step.label} transform={`translate(0, ${i * 40})`}>
              <rect x={0} y={0} width={W} height={32} rx={6} className={i === steps.length - 1 ? "fill-emerald-50 stroke-emerald-400 dark:fill-emerald-500/10 dark:stroke-emerald-400/50" : "fill-current opacity-[0.04]"} strokeWidth={i === steps.length - 1 ? 1.5 : 0} />
              <text style={{ fontSize: svgPx(12) }} x={12} y={21} fill="currentColor" opacity={0.8}>
                {step.label}
              </text>
              <text style={{ fontSize: svgPx(13) }} x={W - 12} y={21} textAnchor="end" fontWeight={700} className={i === steps.length - 1 ? "fill-emerald-700 dark:fill-emerald-300" : "fill-current"}>
                {step.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </SectionCard>
  );
}
