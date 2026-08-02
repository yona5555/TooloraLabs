import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";
import CopyButton from "@/components/tool-ui/CopyButton";
import BMIScaleChart from "./BMIScaleChart";
import type { BMIExtendedResult } from "./types";

interface BMIResultProps {
  result: BMIExtendedResult;
  digitStyle: DigitStyle;
}

const NUM = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

export default function BMIResult({ result, digitStyle }: BMIResultProps) {
  const t = useTranslations("tools.bmi-calculator");

  const level = mapBMIToResultLevel(result.category);
  const fmt = (n: number, opts = NUM) => formatLocalizedNumber(n, digitStyle, opts);

  const bmiText = fmt(result.bmi);
  const minWeightText = fmt(result.healthyMinWeight);
  const maxWeightText = fmt(result.healthyMaxWeight);
  const bmiPrimeText = fmt(result.bmi / 25, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ponderalText = fmt(result.ponderalIndex);
  const bodyFatText = fmt(result.bodyFatEstimate);
  const summaryText = `${t("title")}: ${bmiText} — ${t(`levels.${level}.title`)}`;

  let target: { labelKey: "toTargetLoseLabel" | "toTargetGainLabel"; amount: string } | null = null;
  if (result.bmi < 18.5) {
    target = { labelKey: "toTargetGainLabel", amount: fmt(result.healthyMinWeight - result.weightKg) };
  } else if (result.bmi > 24.9) {
    target = { labelKey: "toTargetLoseLabel", amount: fmt(result.weightKg - result.healthyMaxWeight) };
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center justify-between bg-blue-600 px-6 py-3">
        <h2 className="font-bold text-white">{t("aboveFold.resultTitle")}</h2>
        <CopyButton text={summaryText} />
      </div>

      <div className="p-6">
        <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{bmiText}</p>
        <p className="mt-1 font-medium text-blue-600 dark:text-blue-400">
          {t(`levels.${level}.title`)}
        </p>

        <div className="mt-5">
          <BMIScaleChart
            bmi={result.bmi}
            labels={{
              underweight: t("levels.warning.title"),
              normal: t("levels.normal.title"),
              overweight: t("levels.high.title"),
              obese: t("levels.critical.title"),
              yourBmi: t("aboveFold.resultTitle"),
            }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.healthyRangeLabel")}</dt>
            <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {minWeightText}–{maxWeightText} {t("aboveFold.kgUnit")}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.bmiPrimeLabel")}</dt>
            <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {bmiPrimeText}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.ponderalLabel")}</dt>
            <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {ponderalText}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400" title={t("aboveFold.bodyFatNote")}>
              {t("aboveFold.bodyFatLabel")}
            </dt>
            <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {bodyFatText}%
            </dd>
          </div>
          <div className="col-span-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              {target ? t(`aboveFold.${target.labelKey}`) : t("aboveFold.alreadyHealthy")}
            </dt>
            {target && (
              <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {target.amount} {t("aboveFold.kgUnit")}
              </dd>
            )}
          </div>
        </dl>
      </div>
    </div>
  );
}
