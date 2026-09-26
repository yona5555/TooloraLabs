import { getTranslations } from "next-intl/server";
import { Coins } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import NeumorphicIconBadge from "@/components/tool-ui/NeumorphicIconBadge";

/** Real exact-tip vs round-up-to-nearest-$5 comparison, a common real practice for cash tipping. */
const BILL = 42;
const TIP_PERCENT = 18;
const EXACT_TOTAL = BILL * (1 + TIP_PERCENT / 100);
const ROUNDED_TOTAL = Math.ceil(EXACT_TOTAL / 5) * 5;
const EXTRA = ROUNDED_TOTAL - EXACT_TOTAL;

export default async function TipRoundUpDiagram() {
  const t = await getTranslations("tools.tip-calculator.roundUpDiagram");
  const tRoot = await getTranslations("tools.tip-calculator");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { bill: BILL.toFixed(2), percent: TIP_PERCENT })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <NeumorphicIconBadge icon={Coins} />
        </div>
        <div dir="ltr" className="min-w-0 flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{tRoot("workedExampleTitle")}</p>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-600 dark:text-zinc-300">{t("exactLabel")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">${EXACT_TOTAL.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <dt className="font-semibold text-emerald-700 dark:text-emerald-300">{t("roundedLabel")}</dt>
              <dd className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">${ROUNDED_TOTAL.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <dt>{t("extraLabel")}</dt>
              <dd className="font-mono">+${EXTRA.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
