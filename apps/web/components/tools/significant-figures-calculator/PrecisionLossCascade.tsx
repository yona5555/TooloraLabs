"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SignificantFiguresCalculator } from "@tooloralabs/tools";

const tool = new SignificantFiguresCalculator();

/** Type #9 (Timeline with Stations): a real two-step calculation — multiply, then add — with precision tracked at each station. Once a low-precision number enters the chain, every later step inherits that limit; precision lost early can never come back. */
export default function PrecisionLossCascade() {
  const t = useTranslations("tools.significant-figures-calculator.education.cascade");

  const step1 = tool.execute({ operation: "multiply", rawValueA: "12.5", rawValueB: "4.0", roundToDigits: 0 }, { locale: "en-US" });
  if (!step1.success || step1.data.error) return null;
  const step1Rounded = step1.data.roundedResult;

  const step2 = tool.execute({ operation: "add", rawValueA: `${step1Rounded}`, rawValueB: "3.142", roundToDigits: 0 }, { locale: "en-US" });
  if (!step2.success || step2.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.multiply")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`12.5 × 4.0 = ${step1Rounded}`}</span>
          <span className="ms-auto text-xs text-zinc-400">{t("worked.sigFigs", { count: step1.data.resultSigFigs ?? 0 })}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.add")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${step1Rounded} + 3.142 = ${step2.data.roundedResult}`}</span>
          <span className="ms-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t("resultBadge")}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.afterStep1"), value: t("worked.sigFigs", { count: step1.data.resultSigFigs ?? 0 }) },
            { label: t("worked.afterStep2"), value: `${step2.data.roundedResult}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
