import { getTranslations } from "next-intl/server";
import { Receipt } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import NeumorphicIconBadge from "@/components/tool-ui/NeumorphicIconBadge";

/** Real rounding example: unrounded tax computation vs the cent-rounded figure actually billed. */
const SUBTOTAL = 1093.5;
const TAX_PERCENT = 8.5;
const RAW_TAX = SUBTOTAL * (TAX_PERCENT / 100);
const ROUNDED_TAX = Math.round(RAW_TAX * 100) / 100;
const DIFFERENCE = ROUNDED_TAX - RAW_TAX;

export default async function InvoiceRoundingImpactDiagram() {
  const t = await getTranslations("tools.batch-invoice-calculator.roundingImpactDiagram");
  const tRoot = await getTranslations("tools.batch-invoice-calculator");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { subtotal: SUBTOTAL.toFixed(2), percent: TAX_PERCENT })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <NeumorphicIconBadge icon={Receipt} />
          <p className="max-w-[14rem] text-sm text-zinc-600 dark:text-zinc-300">{t("note")}</p>
        </div>
        <div dir="ltr" className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{tRoot("workedExampleTitle")}</p>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-600 dark:text-zinc-300">{t("rawLabel")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">${RAW_TAX.toFixed(6)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <dt className="font-semibold text-emerald-700 dark:text-emerald-300">{t("billedLabel")}</dt>
              <dd className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">${ROUNDED_TAX.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <dt>{t("differenceLabel")}</dt>
              <dd className="font-mono">{DIFFERENCE >= 0 ? "+" : ""}${DIFFERENCE.toFixed(6)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
