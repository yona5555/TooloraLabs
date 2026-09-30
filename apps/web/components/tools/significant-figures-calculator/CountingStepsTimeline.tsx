"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { countSignificantFigures } from "@tooloralabs/tools";

const RAW = "0.007060";

/** Type #9 (Timeline with Stations): the actual counting algorithm applied to a genuinely tricky case, 0.007060 — leading zeros skipped, then every digit from the first non-zero digit onward (including the trailing zero after it) counts. */
export default function CountingStepsTimeline() {
  const t = useTranslations("tools.significant-figures-calculator.education.countingSteps");
  const count = countSignificantFigures(RAW);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-44 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.start")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{RAW}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-44 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.skipLeading")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">0.00[7060]</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-44 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.countRest")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("worked.count", { count })}</span>
          <span className="ms-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t("resultBadge")}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.digits"), value: "7, 0, 6, 0" },
            { label: t("worked.result"), value: t("worked.count", { count }), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
