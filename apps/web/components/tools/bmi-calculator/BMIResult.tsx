import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";
import CopyButton from "@/components/tool-ui/CopyButton";

interface BMIResultData {
  bmi: number;
  category: string;
}

interface BMIResultProps {
  result: BMIResultData;
  digitStyle: DigitStyle;
}

type Recommendation = {
  title: string;
  description: string;
};

export default function BMIResult({ result, digitStyle }: BMIResultProps) {
  const t = useTranslations("tools.bmi-calculator");
  const level = mapBMIToResultLevel(result.category);
  const recommendations = t.raw(
    `levels.${level}.recommendations`
  ) as Recommendation[];

  const bmiText = formatLocalizedNumber(result.bmi, digitStyle, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const summaryText = `${t("title")}: ${bmiText} — ${t(`levels.${level}.title`)}`;

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h2>
        <CopyButton text={summaryText} />
      </div>

      <div className="mt-4">
        <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{bmiText}</p>
        <p className="mt-1 text-lg font-medium text-zinc-900 dark:text-zinc-50">{t(`levels.${level}.title`)}</p>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {t(`levels.${level}.description`)}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{t("actionTitle")}</h3>

        <ul className="mt-3 space-y-3">
          {recommendations.map((item) => (
            <li key={item.title}>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
