"use client";
import { useTranslations } from "next-intl";
import { PercentageCalculator as PercentageCalculatorTool } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import PercentageShareExportModal from "./PercentageShareExportModal";
import PercentageLive3D from "./PercentageLive3D";
import { usePercentage } from "./PercentageLiveContext";

const tool = new PercentageCalculatorTool();

/**
 * Result card: the tool's answer as the hero value and sentence, then the deep live table +
 * 3D board of 100 cubes. While a field holds an invalid value (empty, division by zero) the
 * card keeps the last valid calculation and says why.
 */
export default function PercentageResult({ invalid }: { invalid: boolean }) {
  const t = useTranslations("tools.percentage-calculator.result");
  const live = usePercentage();
  const { mode, a, b, fmt, labelA, labelB } = live;
  const { f } = fmt;

  const value = tool.execute({ mode, first: a, second: b }, { locale: "en-US" }).data.value;
  const isPercentageOutput = mode === "what-percent" || mode === "percentage-change" || mode === "percentage-difference";
  const hero = isPercentageOutput ? `${f(value)}%` : f(value);
  const args = { first: f(a), second: f(b), value: f(value) };
  const sentence = {
    "percent-of-number": t("percentOf", args),
    "what-percent": t("whatPercent", args),
    "percentage-change": t("percentageChange", args),
    "reverse-percentage": t("reversePercentage", args),
    "percentage-difference": t("percentageDifference", args),
  }[mode];
  const invalidReason = {
    "percent-of-number": t("invalidValue"),
    "what-percent": t("divisionByZero"),
    "percentage-change": t("originalZero"),
    "reverse-percentage": t("percentZero"),
    "percentage-difference": t("bothZero"),
  }[mode];

  return (
    <SectionCard
      title={t("heading")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col"
      action={
        <PercentageShareExportModal
          inputRows={[
            { label: labelA, value: f(a) },
            { label: labelB, value: f(b) },
          ]}
          resultRows={[]}
          heroLabel={t("heading")}
          heroValue={hero}
          sentence={sentence}
        />
      }
    >
      {invalid && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          {invalidReason} {t("keptLast")}
        </p>
      )}
      <div className="text-center">
        <p dir="ltr" className="font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {hero}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{sentence}</p>
      </div>
      <div className="mt-4 border-t border-zinc-100 pt-4 lg:flex lg:flex-1 lg:flex-col dark:border-zinc-800">
        <LiveTableFill>
          <PercentageLive3D live={live} />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
