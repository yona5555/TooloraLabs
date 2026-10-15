import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { Gender } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import BMRShareExportModal from "./BMRShareExportModal";
import { useBMRLive } from "./BMRLiveContext";
import { BANDS, CUTS, DOMAIN, bandOf, bmiOf, coefOf, weightForBmr, type Coef } from "./bmr";

// three/drei live only in this dynamically imported chunk (the BMI figure, reused).
const FigureScene3D = dynamic(() => import("../bmi-calculator/BMIFigureScene3D"), { ssr: false });

type Props = {
  /** The current fields are invalid: the last good result stays, with a short note. */
  invalid: boolean;
  digitStyle: DigitStyle;
  gender: Gender;
  weightKg: string;
  heightCm: string;
  age: string;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

export default function BMRResult({ invalid, digitStyle, gender, weightKg, heightCm, age, fill = false }: Props) {
  const t = useTranslations("tools.bmr-calculator.result");
  const tForm = useTranslations("tools.bmr-calculator.form");
  const tLabels = useTranslations("tools.bmr-calculator.formulas.labels");
  const tv = useTranslations("tools.bmr-calculator.visuals.result");
  const { body: b, hb, msj, formula, which, bmr } = useBMRLive();

  const fmt = (value: number, d = 0) => formatLocalizedNumber(value, digitStyle, { minimumFractionDigits: d, maximumFractionDigits: d });
  const band = bandOf(bmr);
  const bandName = t(`range.${band.key}`);
  const male = b.gender === "male";
  const isCompare = formula === "compare";
  const bmi = bmiOf(b);

  // The share card keeps the tool's own headline: both values when comparing, else the chosen one.
  const inputRows = [
    { label: tForm("genderLabel"), value: gender === "male" ? tForm("genderMale") : tForm("genderFemale") },
    { label: tForm("weight"), value: `${weightKg} kg` },
    { label: tForm("height"), value: `${heightCm} cm` },
    { label: tForm("age"), value: age },
  ];
  const resultRows = isCompare
    ? [
        { label: t("harrisBenedict"), value: `${fmt(hb)} kcal` },
        { label: t("mifflinStJeor"), value: `${fmt(msj)} kcal` },
      ]
    : [{ label: t("bmrUnit"), value: `${fmt(bmr)} kcal` }];
  const heroValue = isCompare ? `${fmt(hb)} / ${fmt(msj)} kcal` : `${fmt(bmr)} kcal`;

  const terms = (k: Coef, key: string) => {
    const tw = k.w * b.weightKg;
    const th = k.h * b.heightCm;
    const ta = k.a * b.age;
    return [
      { label: tv("termWeight"), formula: `${k.w} × ${fmt(b.weightKg, 1)}`, value: fmt(tw, 1), unit: "kcal" },
      { label: tv("termHeight"), formula: `${k.h} × ${fmt(b.heightCm, 1)}`, value: fmt(th, 1), unit: "kcal" },
      { label: tv("termAge"), formula: `− ${k.a} × ${fmt(b.age)}`, value: `−${fmt(ta, 1)}`, unit: "kcal" },
      { label: tv("termConstant"), formula: key === "msj" ? (male ? tv("constMale") : tv("constFemale")) : tv("constHb"), value: k.c < 0 ? `−${fmt(-k.c, 1)}` : fmt(k.c, 1), unit: "kcal" },
      { label: tv("termSum"), formula: `${fmt(tw, 0)} + ${fmt(th, 0)} − ${fmt(ta, 0)} ${k.c < 0 ? "−" : "+"} ${fmt(Math.abs(k.c), 0)}`, value: fmt(k.c + tw + th - ta), unit: "kcal", emphasize: true },
    ];
  };

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tForm("genderLabel"), formula: tv("given"), value: male ? tForm("genderMale") : tForm("genderFemale") },
        { label: tv("weight"), formula: `${fmt(b.weightKg * 2.20462, 1)} lb`, value: fmt(b.weightKg, 1), unit: "kg" },
        { label: tv("height"), formula: `${fmt(b.heightCm / 2.54, 1)} in`, value: fmt(b.heightCm, 1), unit: "cm" },
        { label: tv("age"), formula: tv("given"), value: fmt(b.age), unit: tv("years") },
        { label: "BMI", formula: `${fmt(b.weightKg, 1)} ÷ ${fmt(b.heightCm / 100, 2)}²`, value: fmt(bmi, 1) },
      ],
    },
    {
      title: tv("groupResult"),
      rows: [
        { label: t("harrisBenedict"), formula: which === "hb" ? tv("headline") : tv("forComparison"), value: fmt(hb), unit: "kcal", emphasize: which === "hb" },
        { label: t("mifflinStJeor"), formula: which === "msj" ? tv("headline") : tv("forComparison"), value: fmt(msj), unit: "kcal", emphasize: which === "msj" },
        { label: tv("difference"), formula: `|${fmt(hb)} − ${fmt(msj)}|`, value: fmt(Math.abs(hb - msj)), unit: "kcal" },
        { label: tv("range"), formula: `${fmt(band.min)}–${fmt(band.max)} kcal`, value: bandName, emphasize: true },
        { label: tv("formula"), formula: tv("given"), value: tLabels(formula) },
      ],
    },
    { title: tv("groupMsj"), rows: terms(coefOf("msj", b.gender), "msj") },
    { title: tv("groupHb"), rows: terms(coefOf("hb", b.gender), "hb") },
    {
      title: tv("groupRate"),
      rows: [
        { label: tv("perHour"), formula: `${fmt(bmr)} ÷ 24`, value: fmt(bmr / 24, 1), unit: "kcal/h" },
        { label: tv("power"), formula: `${fmt(bmr)} × 4184 ÷ 86400`, value: fmt((bmr * 4184) / 86400, 1), unit: "W" },
        { label: tv("kilojoules"), formula: `${fmt(bmr)} × 4.184`, value: fmt(bmr * 4.184), unit: "kJ" },
        { label: tv("perKg"), formula: `${fmt(bmr)} ÷ ${fmt(b.weightKg, 1)}`, value: fmt(bmr / b.weightKg, 1), unit: "kcal/kg" },
      ],
    },
    {
      title: tv("groupCuts"),
      rows: CUTS.map((cut) => ({
        label: tv("weightAt", { kcal: fmt(cut) }),
        formula: tv("solveWeight", { formula: tLabels(which === "hb" ? "harrisBenedict" : "mifflinStJeor") }),
        value: fmt(Math.max(0, weightForBmr(b, cut, which)), 1),
        unit: "kg",
      })),
    },
  ];

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { bmi: fmt(bmi, 1), range: bandName, kcal: `${fmt(bmr)} kcal` })}
      drawing={
        <Scene3D camera={[1.6, 0.6, 3.8]}>
          <FigureScene3D
            heightCm={b.heightCm}
            bmi={Math.min(45, Math.max(13, bmi))}
            color={band.color}
            labels={{ height: `${fmt(b.heightCm)} cm`, bmi: `${fmt(bmr)} kcal`, weight: `${fmt(b.weightKg, 1)} kg` }}
          />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard
      title={t("heading")}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={
        <BMRShareExportModal
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={t("heading")}
          heroValue={heroValue}
          sentence={t("sentence", { value: fmt(bmr), classification: bandName })}
          gauge={{
            zones: BANDS.map((z) => ({ from: z.min, to: z.max, color: z.color })),
            domainMin: DOMAIN[0],
            domainMax: DOMAIN[1],
            value: bmr,
            ticks: [DOMAIN[0], ...CUTS, DOMAIN[1]],
            valueLabel: fmt(bmr),
            caption: bandName,
          }}
        />
      }
    >
      {invalid && <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">{t("invalidMeasurements")}</p>}
      {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
    </SectionCard>
  );
}
