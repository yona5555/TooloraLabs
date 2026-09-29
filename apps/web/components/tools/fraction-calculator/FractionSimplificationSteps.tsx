"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const NUM = 8;
const DEN = 12;

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** Type #9 (Timeline with Stations): the real GCD-based simplification path for 8/12 — find the greatest common divisor, then divide both numerator and denominator by it in one step, landing on the fully reduced fraction. */
export default function FractionSimplificationSteps() {
  const t = useTranslations("tools.fraction-calculator.education.simplification");
  const divisor = gcd(NUM, DEN);
  const simplifiedN = NUM / divisor;
  const simplifiedD = DEN / divisor;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.start")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${NUM}/${DEN}`}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.gcd")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`gcd(${NUM}, ${DEN}) = ${divisor}`}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.divide")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${NUM}÷${divisor} / ${DEN}÷${divisor} = ${simplifiedN}/${simplifiedD}`}</span>
          <span className="ms-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t("resultBadge")}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.original"), value: `${NUM}/${DEN}` },
            { label: t("worked.divisor"), value: `${divisor}` },
            { label: t("worked.simplified"), value: `${simplifiedN}/${simplifiedD}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
