import { useTranslations } from "next-intl";
import LoveHeartDiagram from "./LoveHeartDiagram";
import LoveShareExportModal from "./LoveShareExportModal";
import type { LoveCalculatorOutput } from "./types";

type Props = {
  result: LoveCalculatorOutput;
  name1: string;
  name2: string;
};

function tierKey(percentage: number): "veryLow" | "low" | "medium" | "high" | "veryHigh" {
  if (percentage < 20) return "veryLow";
  if (percentage < 40) return "low";
  if (percentage < 60) return "medium";
  if (percentage < 80) return "high";
  return "veryHigh";
}

export default function LoveResult({ result, name1, name2 }: Props) {
  const t = useTranslations("tools.love-calculator.result");
  const tForm = useTranslations("tools.love-calculator.form");

  if (result.error) {
    return (
      <div className="rounded-2xl border border-pink-200 bg-white shadow-sm dark:border-pink-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-pink-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("emptyName")}</p>
        </div>
      </div>
    );
  }

  const sentence = t("sentence", { name1, name2, percentage: Math.round(result.percentage) });

  return (
    <div className="rounded-2xl border border-pink-200 bg-white shadow-sm dark:border-pink-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-pink-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <LoveShareExportModal
          inputRows={[
            { label: tForm("name1Label"), value: name1 },
            { label: tForm("name2Label"), value: name2 },
          ]}
          resultRows={[]}
          heroLabel={t("heading")}
          heroValue={`${Math.round(result.percentage)}%`}
          sentence={sentence}
        />
      </div>
      <div className="flex flex-col items-center gap-4 p-4 lg:p-6">
        <LoveHeartDiagram percentage={result.percentage} />
        <p className="text-center text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-200">
          {t(`tiers.${tierKey(result.percentage)}`)}
        </p>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{t("forFunOnly")}</p>
      </div>
    </div>
  );
}
