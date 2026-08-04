import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { Gender } from "@tooloralabs/tools";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";
import PdfDownloadButton from "@/components/tool-ui/PdfDownloadButton";
import SectionCard from "@/components/tool-ui/SectionCard";
import BMIScaleChart from "./BMIScaleChart";
import type { BMIExtendedResult, UnitSystem } from "./types";

interface BMIResultProps {
  result: BMIExtendedResult;
  digitStyle: DigitStyle;
  unitSystem: UnitSystem;
  heightCm: string;
  weightKg: string;
  heightFt: string;
  heightIn: string;
  weightLb: string;
  age: string;
  gender: Gender;
}

const NUM = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

const GAUGE_ZONES = [
  { from: 15, to: 18.5, color: "#3b82f6" },
  { from: 18.5, to: 25, color: "#22c55e" },
  { from: 25, to: 30, color: "#f59e0b" },
  { from: 30, to: 40, color: "#ef4444" },
];

export default function BMIResult({
  result,
  digitStyle,
  unitSystem,
  heightCm,
  weightKg,
  heightFt,
  heightIn,
  weightLb,
  age,
  gender,
}: BMIResultProps) {
  const t = useTranslations("tools.bmi-calculator");

  const level = mapBMIToResultLevel(result.category);
  const fmt = (n: number, opts = NUM) => formatLocalizedNumber(n, digitStyle, opts);

  const bmiText = fmt(result.bmi);
  const minWeightText = fmt(result.healthyMinWeight);
  const maxWeightText = fmt(result.healthyMaxWeight);
  const bmiPrimeText = fmt(result.bmi / 25, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ponderalText = fmt(result.ponderalIndex);
  const bodyFatText = fmt(result.bodyFatEstimate);

  let target: { labelKey: "toTargetLoseLabel" | "toTargetGainLabel"; amount: string } | null = null;
  if (result.bmi < 18.5) {
    target = { labelKey: "toTargetGainLabel", amount: fmt(result.healthyMinWeight - result.weightKg) };
  } else if (result.bmi > 24.9) {
    target = { labelKey: "toTargetLoseLabel", amount: fmt(result.weightKg - result.healthyMaxWeight) };
  }

  const pdfInputs =
    unitSystem === "metric"
      ? [
          { label: t("form.heightPlaceholder"), value: `${heightCm} cm` },
          { label: t("form.weightPlaceholder"), value: `${weightKg} kg` },
          { label: t("form.agePlaceholder"), value: age },
          { label: t("form.genderLabel"), value: gender === "male" ? t("form.genderMale") : t("form.genderFemale") },
        ]
      : [
          { label: t("form.heightFeetPlaceholder"), value: `${heightFt} ft` },
          { label: t("form.heightInchesPlaceholder"), value: `${heightIn} in` },
          { label: t("form.weightLbPlaceholder"), value: `${weightLb} lb` },
          { label: t("form.agePlaceholder"), value: age },
          { label: t("form.genderLabel"), value: gender === "male" ? t("form.genderMale") : t("form.genderFemale") },
        ];

  const pdfResults = [
    { label: "BMI", value: bmiText },
    { label: t("aboveFold.categoryLabel"), value: t(`levels.${level}.title`) },
    { label: t("aboveFold.healthyRangeLabel"), value: `${minWeightText}–${maxWeightText} ${t("aboveFold.kgUnit")}` },
    { label: t("aboveFold.bmiPrimeLabel"), value: bmiPrimeText },
    { label: t("aboveFold.ponderalLabel"), value: ponderalText },
    { label: t("aboveFold.bodyFatLabel"), value: `${bodyFatText}%` },
  ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        <PdfDownloadButton
          toolName={t("title")}
          inputs={pdfInputs}
          results={pdfResults}
          gauge={{ zones: GAUGE_ZONES, domainMin: 15, domainMax: 40, value: result.bmi, ticks: [15, 18.5, 25, 30, 40] }}
          filename="bmi-calculator-result.pdf"
        />
      }
    >
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
    </SectionCard>
  );
}
