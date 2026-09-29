"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const START = 80;
const PERCENT = 25;

/** Type #2 (Flow Arrow with Embedded Numbers): a starting value, the percent key applied to it, and the resulting value — each number sits directly on the flow instead of in a separate table, matching how the % key changes the number currently on screen. */
export default function PercentFlowDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.functions.percentFlow");
  const result = START * (1 + PERCENT / 100);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{START}</p>
          <p className="text-xs text-zinc-400">{t("startLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={22} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{`+${PERCENT}%`}</p>
          <p className="text-xs text-blue-500/80">{t("percentLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={22} />
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{result}</p>
          <p className="text-xs text-zinc-400">{t("resultLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: `${START} × (1 + ${PERCENT}/100)` },
            { label: t("worked.result"), value: `${result}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
