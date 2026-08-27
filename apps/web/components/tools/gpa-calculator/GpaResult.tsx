import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import GpaScaleDiagram from "./GpaScaleDiagram";
import type { GpaOperation, GpaResult as Result } from "./types";

type Props = {
  result: Result;
  operation: GpaOperation;
  digitStyle: DigitStyle;
};

export default function GpaResult({ result, operation, digitStyle }: Props) {
  const t = useTranslations("tools.gpa-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  if (result.error === "no-courses") {
    return <ErrorCard heading={t("heading")} message={t("noCourses")} />;
  }
  if (result.error === "invalid-planned-credits") {
    return <ErrorCard heading={t("heading")} message={t("invalidPlannedCredits")} />;
  }

  const isTarget = operation === "target";
  const headline = isTarget ? result.requiredGpa ?? 0 : result.gpa;
  const copyText = fmt(headline);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(headline)}
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

          <GpaScaleDiagram gpa={headline} caption={t("diagramCaption", { value: fmt(headline) })} />

          <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            {isTarget
              ? t("stepTarget", { current: fmt(result.gpa), credits: fmt(result.totalCredits) })
              : t("stepCalculate", { credits: fmt(result.totalCredits) })}
          </p>
        </div>
      </div>
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
