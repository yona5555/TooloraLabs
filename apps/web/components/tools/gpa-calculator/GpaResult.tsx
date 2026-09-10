import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import GpaMainGauge from "./GpaMainGauge";
import GpaScaleDiagram from "./GpaScaleDiagram";
import GpaShareExportModal from "./GpaShareExportModal";
import { bandForGpa } from "./types";
import type { GpaOperation, GpaResult as Result } from "./types";

type Props = {
  result: Result;
  operation: GpaOperation;
  digitStyle: DigitStyle;
  courseCount: number;
  targetGpaInput: string;
  plannedCreditsInput: string;
};

export default function GpaResult({ result, operation, digitStyle, courseCount, targetGpaInput, plannedCreditsInput }: Props) {
  const t = useTranslations("tools.gpa-calculator.result");
  const tGauge = useTranslations("tools.gpa-calculator.gauge");
  const tForm = useTranslations("tools.gpa-calculator.form");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  if (result.error === "no-courses") {
    return <ErrorCard heading={t("heading")} message={t("noCourses")} />;
  }
  if (result.error === "invalid-planned-credits") {
    return <ErrorCard heading={t("heading")} message={t("invalidPlannedCredits")} />;
  }

  const isTarget = operation === "target";
  const headline = isTarget ? result.requiredGpa ?? 0 : result.gpa;
  const heroValue = fmt(headline);
  const gaugeGpa = Math.min(4.0, Math.max(0, headline));
  const band = bandForGpa(gaugeGpa);

  const sentence = isTarget
    ? t("stepTarget", { current: fmt(result.gpa), credits: fmt(result.totalCredits) })
    : t("stepCalculate", { credits: fmt(result.totalCredits) });

  const inputRows = isTarget
    ? [
        { label: tForm("currentGpaLabel"), value: fmt(result.gpa) },
        { label: tForm("targetGpaLabel"), value: targetGpaInput },
        { label: tForm("plannedCreditsLabel"), value: plannedCreditsInput },
      ]
    : [{ label: t("courseCountLabel"), value: String(courseCount) }];

  const resultRows = [
    { label: t("heading"), value: heroValue },
    { label: t("creditsLabel"), value: fmt(result.totalCredits) },
    { label: t("qualityPointsLabel"), value: fmt(result.totalQualityPoints) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <GpaShareExportModal
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("heading")}
            heroValue={heroValue}
            sentence={sentence}
            gauge={{
              zones: [
                { from: 0, to: 2.0, color: "#ef4444" },
                { from: 2.0, to: 3.0, color: "#f59e0b" },
                { from: 3.0, to: 3.5, color: "#3b82f6" },
                { from: 3.5, to: 4.0, color: "#10b981" },
              ],
              domainMin: 0,
              domainMax: 4.0,
              value: gaugeGpa,
              ticks: [0, 1.0, 2.0, 3.0, 3.5, 4.0],
              valueLabel: heroValue,
              caption: tGauge(band),
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {heroValue}
        </p>

        {isTarget ? (
          <p className="mt-3 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {result.isAchievable ? t("achievable") : t("notAchievable")}
          </p>
        ) : (
          <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t("creditsSummary", { credits: fmt(result.totalCredits), points: fmt(result.totalQualityPoints) })}
          </p>
        )}

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <GpaMainGauge gpa={gaugeGpa} valueLabel={heroValue} />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <GpaScaleDiagram gpa={headline} caption={t("diagramCaption", { value: heroValue })} />
        </div>

        <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">{sentence}</p>
      </SectionCard>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
