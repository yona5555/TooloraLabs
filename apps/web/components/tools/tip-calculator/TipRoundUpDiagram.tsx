import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real exact-tip vs round-up-to-nearest-$5 comparison, a common real practice for cash tipping. */
const BILL = 42;
const TIP_PERCENT = 18;
const EXACT_TOTAL = BILL * (1 + TIP_PERCENT / 100);
const ROUNDED_TOTAL = Math.ceil(EXACT_TOTAL / 5) * 5;

export default async function TipRoundUpDiagram() {
  const t = await getTranslations("tools.tip-calculator.roundUpDiagram");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { bill: BILL.toFixed(2), percent: TIP_PERCENT })}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4 overflow-x-auto">
        <svg width={360} height={90} viewBox="0 0 360 90" role="img" aria-label={t("title")} className="min-w-[320px] text-current">
          <rect x={10} y={20} width={150} height={50} rx={8} className="fill-current opacity-[0.05]" />
          <text x={85} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
            {t("exactLabel")}
          </text>
          <text x={85} y={58} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">
            ${EXACT_TOTAL.toFixed(2)}
          </text>

          <text x={190} y={50} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor" opacity={0.5}>
            →
          </text>

          <rect x={200} y={20} width={150} height={50} rx={8} className="fill-emerald-50 stroke-emerald-400 dark:fill-emerald-500/10 dark:stroke-emerald-400/50" strokeWidth={1.5} />
          <text x={275} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
            {t("roundedLabel")}
          </text>
          <text x={275} y={58} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
            ${ROUNDED_TOTAL.toFixed(2)}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
