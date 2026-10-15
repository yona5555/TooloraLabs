import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import type { BodyFatResult as Result, Gender } from "./types";
import BodyFatShareExportModal from "./BodyFatShareExportModal";
import { useBodyFatLive } from "./BodyFatLiveContext";
import { ACSM, ESSENTIAL, IN, aceClasses, aceCuts, aceOf, circIn, waistFor, type Measures } from "./ace";

// three/drei live only in this dynamically imported chunk (the BMI figure, reused with a fat layer).
const FigureScene3D = dynamic(() => import("../bmi-calculator/BMIFigureScene3D"), { ssr: false });

type Props = {
  /** The last valid result and the measurements it was computed from. */
  result: Result;
  measures: Measures;
  /** The current fields are invalid: the last good result stays, with a short note. */
  invalid: boolean;
  gender: Gender;
  heightCm: string;
  neckCm: string;
  waistCm: string;
  hipCm: string;
  digitStyle: DigitStyle;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

const LEAN_COLOR = "#c98b74";

export default function BodyFatResult({ result, measures: m, invalid, gender, heightCm, neckCm, waistCm, hipCm, digitStyle, fill = false }: Props) {
  const t = useTranslations("tools.body-fat-calculator.result");
  const tForm = useTranslations("tools.body-fat-calculator.form");
  const tCategories = useTranslations("tools.body-fat-calculator.categories");
  const tv = useTranslations("tools.body-fat-calculator.visuals.result");
  const { weightKg, weightSeed } = useBodyFatLive();

  const fmt = (value: number, d = 1) => formatLocalizedNumber(value, digitStyle, { minimumFractionDigits: d, maximumFractionDigits: d });
  const bf = result.bodyFatPercent;
  const g = m.gender;
  const cls = aceOf(g, bf);
  const classes = aceClasses(g);
  const ci = classes.findIndex((c) => c.key === cls.key);
  const catName = tCategories(cls.key);
  const heroValue = `${fmt(bf)}%`;
  const [aLo, aHi] = ACSM[g];
  const acsmState = bf < aLo ? "acsmBelow" : bf > aHi ? "acsmAbove" : "acsmIn";

  const hIn = m.heightCm / IN;
  const nIn = m.neckCm / IN;
  const wIn = m.waistCm / IN;
  const hipIn = m.hipCm / IN;
  const c = circIn(m);
  const male = g === "male";
  const navy = male
    ? `86.010×log₁₀(${fmt(c, 2)}) − 70.041×log₁₀(${fmt(hIn, 2)}) + 36.76`
    : `163.205×log₁₀(${fmt(c, 2)}) − 97.684×log₁₀(${fmt(hIn, 2)}) − 78.387`;

  const fatKg = (weightKg * bf) / 100;
  const essKg = (weightKg * ESSENTIAL[g]) / 100;
  const below = ci >= 2 ? classes[ci - 1] : null;

  const inputRows = [
    { label: tForm("genderLabel"), value: gender === "male" ? tForm("genderMale") : tForm("genderFemale") },
    { label: tForm("height"), value: `${heightCm} cm` },
    { label: tForm("neck"), value: `${neckCm} cm` },
    { label: tForm("waist"), value: `${waistCm} cm` },
    ...(gender === "female" ? [{ label: tForm("hip"), value: `${hipCm} cm` }] : []),
  ];
  const resultRows = [{ label: t("heading"), value: `${heroValue} (${catName})` }];

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tForm("genderLabel"), formula: tv("given"), value: male ? tForm("genderMale") : tForm("genderFemale") },
        { label: tv("height"), formula: `${fmt(hIn, 2)} in`, value: fmt(m.heightCm), unit: "cm" },
        { label: tv("neck"), formula: `${fmt(nIn, 2)} in`, value: fmt(m.neckCm), unit: "cm" },
        { label: tv("waist"), formula: `${fmt(wIn, 2)} in`, value: fmt(m.waistCm), unit: "cm" },
        ...(male ? [] : [{ label: tv("hip"), formula: `${fmt(hipIn, 2)} in`, value: fmt(m.hipCm), unit: "cm" }]),
      ],
    },
    {
      title: tv("groupResult"),
      rows: [
        { label: tv("bodyFat"), formula: navy, value: fmt(bf), unit: "%", emphasize: true },
        { label: tv("aceClass"), formula: `${fmt(cls.min, 0)}–${Number.isFinite(cls.max) ? fmt(cls.max, 0) : "∞"} %`, value: catName, emphasize: true },
        { label: tv("acsm"), formula: `${fmt(aLo, 0)}–${fmt(aHi, 0)} %`, value: tv(acsmState) },
        below
          ? { label: tv("toBelow", { category: tCategories(below.key) }), formula: `${fmt(bf)} − ${fmt(below.max, 0)}`, value: fmt(bf - below.max), unit: "%" }
          : { label: tv("toBelow", { category: tCategories(cls.key) }), formula: "—", value: tv("leanRange") },
      ],
    },
    {
      title: tv("groupNavy"),
      rows: [
        { label: tv("circ"), formula: male ? `${fmt(wIn, 2)} − ${fmt(nIn, 2)}` : `${fmt(wIn, 2)} + ${fmt(hipIn, 2)} − ${fmt(nIn, 2)}`, value: fmt(c, 2), unit: "in" },
        { label: tv("logCirc"), formula: `log₁₀(${fmt(c, 2)})`, value: fmt(Math.log10(c), 4) },
        { label: tv("logHeight"), formula: `log₁₀(${fmt(hIn, 2)})`, value: fmt(Math.log10(hIn), 4) },
        { label: tv("termCirc"), formula: `${male ? "86.010" : "163.205"} × ${fmt(Math.log10(c), 4)}`, value: fmt((male ? 86.01 : 163.205) * Math.log10(c), 2) },
        { label: tv("termHeight"), formula: `${male ? "70.041" : "97.684"} × ${fmt(Math.log10(hIn), 4)}`, value: fmt((male ? 70.041 : 97.684) * Math.log10(hIn), 2) },
      ],
    },
    {
      title: tv("groupCuts"),
      rows: aceCuts(g).map((cut, i) => ({
        label: `${fmt(cut, 0)}% · ${tCategories(classes[i].key)}`,
        formula: tv("solveWaist", { bf: fmt(cut, 0) }),
        value: fmt(waistFor(m, cut)),
        unit: "cm",
      })),
    },
    {
      title: tv("groupMass"),
      rows: [
        { label: tv("weight"), formula: weightKg === weightSeed ? `22 × ${fmt(m.heightCm / 100, 2)}²` : tv("weightSet"), value: fmt(weightKg), unit: "kg" },
        { label: tv("fatMass"), formula: `${fmt(weightKg)} × ${fmt(bf)}%`, value: fmt(fatKg), unit: "kg", emphasize: true },
        { label: tv("leanMass"), formula: `${fmt(weightKg)} − ${fmt(fatKg)}`, value: fmt(weightKg - fatKg), unit: "kg" },
        { label: tv("essentialFat"), formula: `${fmt(weightKg)} × ${fmt(ESSENTIAL[g], 0)}%`, value: fmt(essKg), unit: "kg" },
        { label: tv("storageFat"), formula: `${fmt(fatKg)} − ${fmt(essKg)}`, value: fmt(Math.max(0, fatKg - essKg)), unit: "kg" },
      ],
    },
  ];

  // The lean core is drawn at the fat-free-mass index; the shell's extra girth follows body fat.
  const ffmi = (weightKg - fatKg) / (m.heightCm / 100) ** 2;

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { bf: heroValue, category: catName })}
      drawing={
        <Scene3D camera={[1.6, 0.6, 3.8]}>
          <FigureScene3D
            heightCm={m.heightCm}
            bmi={Math.min(24, Math.max(15, ffmi))}
            color={LEAN_COLOR}
            fatLayer={{ thickness: (bf / 100) * 1.5, color: cls.color }}
            labels={{ height: `${fmt(m.heightCm)} cm`, bmi: `${heroValue}`, weight: `${fmt(fatKg)} kg` }}
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
        <BodyFatShareExportModal
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={t("heading")}
          heroValue={heroValue}
          sentence={t("sentence", { percent: fmt(bf), category: catName })}
          gauge={{
            zones: classes.map((z) => ({ from: Math.max(z.min, 0), to: Number.isFinite(z.max) ? z.max : z.min + 12, color: z.color })),
            domainMin: 0,
            domainMax: classes[4].min + 12,
            value: bf,
            ticks: [0, ...aceCuts(g), classes[4].min + 12],
            valueLabel: heroValue,
            caption: catName,
          }}
        />
      }
    >
      {invalid && <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">{t("invalidMeasurements")}</p>}
      {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
    </SectionCard>
  );
}
