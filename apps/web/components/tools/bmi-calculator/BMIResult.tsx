import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";
import CopyButton from "@/components/tool-ui/CopyButton";
import BMIScaleChart from "./BMIScaleChart";

interface BMIResultData {
  bmi: number;
  category: string;
  healthyMinWeight: number;
  healthyMaxWeight: number;
}

interface BMIResultProps {
  result: BMIResultData;
  digitStyle: DigitStyle;
}

export default function BMIResult({ result, digitStyle }: BMIResultProps) {
  const t = useTranslations("tools.bmi-calculator");
  const level = mapBMIToResultLevel(result.category);

  const numberFormat = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
  const bmiText = formatLocalizedNumber(result.bmi, digitStyle, numberFormat);
  const minWeightText = formatLocalizedNumber(result.healthyMinWeight, digitStyle, numberFormat);
  const maxWeightText = formatLocalizedNumber(result.healthyMaxWeight, digitStyle, numberFormat);
  const bmiPrimeText = formatLocalizedNumber(result.bmi / 25, digitStyle, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const summaryText = `${t("title")}: ${bmiText} — ${t(`levels.${level}.title`)}`;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">{t("aboveFold.resultTitle")}</h2>
        <CopyButton text={summaryText} />
      </div>

      <p className="mt-3 text-4xl font-bold text-zinc-900 dark:text-zinc-50">{bmiText}</p>
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

      <ul className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <li className="flex items-center justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">{t("aboveFold.healthyRangeLabel")}</span>
          <span dir="ltr" className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
            {minWeightText}–{maxWeightText} {t("aboveFold.kgUnit")}
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">{t("aboveFold.bmiPrimeLabel")}</span>
          <span dir="ltr" className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
            {bmiPrimeText}
          </span>
        </li>
      </ul>
    </div>
  );
}
