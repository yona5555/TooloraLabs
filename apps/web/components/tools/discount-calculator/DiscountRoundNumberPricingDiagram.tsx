import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real psychological-pricing comparison: a $99.99-style charm price vs a round $100, same 20% discount applied via the tool's own formula. */
const DISCOUNT_PERCENT = 20;
const CHARM_ORIGINAL = 124.99;
const ROUND_ORIGINAL = 125;
const CHARM_FINAL = CHARM_ORIGINAL * (1 - DISCOUNT_PERCENT / 100);
const ROUND_FINAL = ROUND_ORIGINAL * (1 - DISCOUNT_PERCENT / 100);

export default async function DiscountRoundNumberPricingDiagram() {
  const t = await getTranslations("tools.discount-calculator.roundNumberPricingDiagram");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { percent: DISCOUNT_PERCENT })}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4 overflow-x-auto">
        <svg width={360} height={90} viewBox="0 0 360 90" role="img" aria-label={t("title")} className="min-w-[320px] text-current">
          <rect x={10} y={20} width={150} height={50} rx={8} className="fill-current opacity-[0.05]" />
          <text x={85} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
            {t("charmLabel", { price: CHARM_ORIGINAL.toFixed(2) })}
          </text>
          <text x={85} y={58} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">
            ${CHARM_FINAL.toFixed(2)}
          </text>

          <text x={190} y={50} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor" opacity={0.5}>
            vs
          </text>

          <rect x={200} y={20} width={150} height={50} rx={8} className="fill-current opacity-[0.05]" />
          <text x={275} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
            {t("roundLabel", { price: ROUND_ORIGINAL.toFixed(2) })}
          </text>
          <text x={275} y={58} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">
            ${ROUND_FINAL.toFixed(2)}
          </text>
        </svg>
      </div>
      <p className="mt-3 text-center text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
