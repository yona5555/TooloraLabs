import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { Gender } from "@tooloralabs/tools";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import BMIShareExportModal from "./BMIShareExportModal";
import { BMI_MID, WHO_CUTS, weightAt, whoOf } from "./who";
import type { BMIExtendedResult, UnitSystem } from "./types";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const BMIFigureScene3D = dynamic(() => import("./BMIFigureScene3D"), { ssr: false });

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
  /** Page mode: the table fills the stretched Result column (§27). Off in the embed. */
  fill?: boolean;
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
  fill = false,
}: BMIResultProps) {
  const t = useTranslations("tools.bmi-calculator");
  const tv = useTranslations("tools.bmi-calculator.visuals");

  const level = mapBMIToResultLevel(result.category);
  const fmt = (n: number, opts = NUM) => formatLocalizedNumber(n, digitStyle, opts);
  const f2 = (n: number) => fmt(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const bmiText = fmt(result.bmi);
  const minWeightText = fmt(result.healthyMinWeight);
  const maxWeightText = fmt(result.healthyMaxWeight);
  const bmiPrimeText = f2(result.bmi / 25);
  const ponderalText = fmt(result.ponderalIndex);
  const bodyFatText = fmt(result.bodyFatEstimate);
  const who = whoOf(result.bmi);
  const whoName = tv(`who.${who.key}`);
  const hM = f2(result.heightCm / 100);
  const kg = t("aboveFold.kgUnit");

  let target: { labelKey: "toTargetLoseLabel" | "toTargetGainLabel"; amount: number } | null = null;
  if (result.bmi < 18.5) {
    target = { labelKey: "toTargetGainLabel", amount: result.healthyMinWeight - result.weightKg };
  } else if (result.bmi > 24.9) {
    target = { labelKey: "toTargetLoseLabel", amount: result.weightKg - result.healthyMaxWeight };
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
    { label: t("aboveFold.healthyRangeLabel"), value: `${minWeightText}–${maxWeightText} ${kg}` },
    { label: t("aboveFold.bmiPrimeLabel"), value: bmiPrimeText },
    { label: t("aboveFold.ponderalLabel"), value: ponderalText },
    { label: t("aboveFold.bodyFatLabel"), value: `${bodyFatText}%` },
  ];

  const sentence = t("aboveFold.sentence", { bmi: bmiText, category: t(`levels.${level}.title`) });
  const ageNum = Number(age) || 0;
  const sex = gender === "male" ? 1 : 0;

  const groups: LiveTableGroup[] = [
    {
      title: tv("result.groupInputs"),
      rows: [
        { label: tv("result.height"), formula: "h", value: fmt(result.heightCm), unit: "cm" },
        { label: tv("result.weight"), formula: "w", value: fmt(result.weightKg), unit: kg },
        { label: t("form.agePlaceholder"), formula: tv("result.given"), value: String(ageNum) },
        { label: t("form.genderLabel"), formula: tv("result.given"), value: gender === "male" ? t("form.genderMale") : t("form.genderFemale") },
      ],
    },
    {
      title: tv("result.groupResult"),
      rows: [
        { label: "BMI", formula: `${fmt(result.weightKg)} ÷ ${hM}²`, value: bmiText, unit: "kg/m²", emphasize: true },
        { label: tv("result.whoClass"), formula: `${fmt(who.min)}–${Number.isFinite(who.max) ? fmt(who.max) : "∞"}`, value: whoName, emphasize: true },
        { label: t("aboveFold.bmiPrimeLabel"), formula: `${bmiText} ÷ 25`, value: bmiPrimeText },
        { label: t("aboveFold.ponderalLabel"), formula: `${fmt(result.weightKg)} ÷ ${hM}³`, value: ponderalText, unit: "kg/m³" },
        { label: t("aboveFold.bodyFatLabel"), formula: ageNum <= 15 ? `1.51×${bmiText} − 0.7×${ageNum} − 3.6×${sex} + 1.4` : `1.2×${bmiText} + 0.23×${ageNum} − 10.8×${sex} − 5.4`, value: bodyFatText, unit: "%" },
      ],
    },
    {
      title: tv("result.groupRange"),
      rows: [
        { label: tv("result.minWeight"), formula: `18.5 × ${hM}²`, value: minWeightText, unit: kg },
        { label: tv("result.maxWeight"), formula: `24.9 × ${hM}²`, value: maxWeightText, unit: kg },
        {
          label: target ? t(`aboveFold.${target.labelKey}`) : tv("result.toRange"),
          formula: target ? (target.labelKey === "toTargetLoseLabel" ? `${fmt(result.weightKg)} − ${maxWeightText}` : `${minWeightText} − ${fmt(result.weightKg)}`) : "0",
          value: target ? fmt(target.amount) : t("aboveFold.alreadyHealthy"),
          unit: target ? kg : undefined,
          emphasize: true,
        },
        { label: tv("result.midWeight"), formula: `${BMI_MID} × ${hM}²`, value: fmt(weightAt(BMI_MID, result.heightCm)), unit: kg },
      ],
    },
    {
      title: tv("result.groupCuts"),
      rows: WHO_CUTS.map((c) => ({
        label: `BMI ${fmt(c)} · ${tv(`who.${whoOf(c).key}`)}`,
        formula: `${fmt(c)} × ${hM}²`,
        value: fmt(weightAt(c, result.heightCm)),
        unit: kg,
      })),
    },
  ];

  const layout = (
    <LiveTable3DLayout
      headings={[tv("result.colQuantity"), tv("result.colFormula"), tv("result.colValue")]}
      groups={groups}
      hint={tv("result.hint")}
      caption={tv("result.caption", { category: whoName })}
      drawing={
        <Scene3D camera={[1.6, 0.6, 3.8]}>
          <BMIFigureScene3D
            heightCm={result.heightCm}
            bmi={result.bmi}
            color={who.color}
            labels={{ height: `${fmt(result.heightCm)} cm`, bmi: `BMI ${bmiText}`, weight: `${fmt(result.weightKg)} kg` }}
          />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={
        <BMIShareExportModal
          inputRows={pdfInputs}
          resultRows={pdfResults}
          heroLabel="BMI"
          heroValue={bmiText}
          sentence={sentence}
          gauge={{ zones: GAUGE_ZONES, domainMin: 15, domainMax: 40, value: result.bmi, ticks: [15, 18.5, 25, 30, 40], valueLabel: bmiText, caption: t(`levels.${level}.title`) }}
        />
      }
    >
      {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
    </SectionCard>
  );
}
