import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real rounding example: unrounded tax computation vs the cent-rounded figure actually billed. */
const SUBTOTAL = 1093.5;
const TAX_PERCENT = 8.5;
const RAW_TAX = SUBTOTAL * (TAX_PERCENT / 100);
const ROUNDED_TAX = Math.round(RAW_TAX * 100) / 100;

export default async function InvoiceRoundingImpactDiagram() {
  const t = await getTranslations("tools.batch-invoice-calculator.roundingImpactDiagram");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { subtotal: SUBTOTAL.toFixed(2), percent: TAX_PERCENT })}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4 overflow-x-auto">
        <svg width={360} height={90} viewBox="0 0 360 90" role="img" aria-label={t("title")} className="min-w-[320px] text-current">
          <rect x={10} y={20} width={150} height={50} rx={8} className="fill-current opacity-[0.05]" />
          <text x={85} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
            {t("rawLabel")}
          </text>
          <text x={85} y={58} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">
            ${RAW_TAX.toFixed(6)}
          </text>

          <text x={190} y={50} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor" opacity={0.5}>
            →
          </text>

          <rect x={200} y={20} width={150} height={50} rx={8} className="fill-emerald-50 stroke-emerald-400 dark:fill-emerald-500/10 dark:stroke-emerald-400/50" strokeWidth={1.5} />
          <text x={275} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
            {t("billedLabel")}
          </text>
          <text x={275} y={58} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
            ${ROUNDED_TAX.toFixed(2)}
          </text>
        </svg>
      </div>
      <p className="mt-3 text-center text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
