"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import MacroShareExportModal from "./MacroShareExportModal";
import type { MacroSnapshot } from "./MacroLiveContext";
import { AMDR, COLORS, GOALS, KCAL_G, MACROS, REF_WEIGHT_KG, SYMBOL, inAmdr, splitFor } from "./macros";
import { useSnapTableRows } from "../ideal-weight-calculator/useSnapTableRows";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const MacroPlateScene3D = dynamic(() => import("./MacroPlateScene3D"), { ssr: false });

const MEALS = 3;

type Props = {
  /** The last valid result. */
  snap: MacroSnapshot;
  /** The current total is invalid: the last good result stays, with the calculator's note. */
  invalid: boolean;
  digitStyle: DigitStyle;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

export default function MacroResult({ snap, invalid, digitStyle, fill = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useSnapTableRows(wrapRef);
  const t = useTranslations("tools.macro-calculator.result");
  const tForm = useTranslations("tools.macro-calculator.form");
  const tGoals = useTranslations("tools.macro-calculator.goals.labels");
  const tv = useTranslations("tools.macro-calculator.visuals.result");
  const n0 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });
  const n1 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });
  const n2 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const { calories: kcal, goal } = snap;
  const pctText = MACROS.map((m) => n0(snap[m].percent)).join(" / ");
  const totalGrams = MACROS.reduce((s, m) => s + snap[m].grams, 0);
  const amdrOk = MACROS.every((m) => inAmdr(m, snap[m].percent));

  const inputRows = [
    { label: tForm("totalCalories"), value: `${n0(kcal)} kcal` },
    { label: tForm("goalLabel"), value: tGoals(goal) },
  ];
  const resultRows = MACROS.map((m) => ({ label: t(m), value: `${n0(snap[m].grams)} g (${n0(snap[m].calories)} kcal)` }));
  const sentence = t("sentence", { protein: `${n0(snap.protein.grams)} g`, carbs: `${n0(snap.carbs.grams)} g`, fat: `${n0(snap.fat.grams)} g` });

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tForm("totalCalories"), formula: tv("given"), value: n0(kcal), unit: "kcal" },
        { label: tForm("goalLabel"), formula: tv("given"), value: tGoals(goal) },
        { label: tv("split"), formula: "P / C / F", value: pctText, unit: "%" },
      ],
    },
    {
      title: tv("groupGrams"),
      rows: [
        ...MACROS.map((m) => ({
          label: t(m),
          formula: `${n0(kcal)} × ${n0(snap[m].percent)}% ÷ ${KCAL_G[m]}`,
          value: n0(snap[m].grams),
          unit: "g",
          emphasize: true,
        })),
        { label: tv("totalGrams"), formula: MACROS.map((m) => n0(snap[m].grams)).join(" + "), value: n0(totalGrams), unit: "g" },
      ],
    },
    {
      title: tv("groupCalories"),
      rows: [
        ...MACROS.map((m) => ({
          label: t(m),
          formula: `${n0(kcal)} × ${n0(snap[m].percent)}%`,
          value: n0(snap[m].calories),
          unit: "kcal",
        })),
        { label: tv("check"), formula: MACROS.map((m) => n0(snap[m].calories)).join(" + "), value: n0(kcal), unit: "kcal" },
        { label: tv("density"), formula: `${n0(kcal)} ÷ ${n0(totalGrams)}`, value: n2(kcal / totalGrams), unit: "kcal/g" },
      ],
    },
    {
      title: tv("groupMeal", { n: MEALS }),
      rows: MACROS.map((m) => ({ label: t(m), formula: `${n0(snap[m].grams)} ÷ ${MEALS}`, value: n0(snap[m].grams / MEALS), unit: "g" })),
    },
    {
      title: tv("groupAmdr"),
      rows: [
        ...MACROS.map((m) => ({
          label: t(m),
          formula: `${AMDR[m][0]}–${AMDR[m][1]}%`,
          value: `${n0(snap[m].percent)}% ${inAmdr(m, snap[m].percent) ? "✓" : "✗"}`,
        })),
        { label: tv("amdrAll"), formula: "IOM 2005", value: amdrOk ? tv("yes") : tv("no"), emphasize: true },
        { label: tv("perKg"), formula: `${n0(snap.protein.grams)} ÷ ${REF_WEIGHT_KG}`, value: n2(snap.protein.grams / REF_WEIGHT_KG), unit: "g/kg" },
      ],
    },
    {
      title: tv("groupGoals"),
      rows: GOALS.map((g) => {
        const sp = splitFor(kcal, g)!;
        return {
          label: tGoals(g),
          formula: MACROS.map((m) => n0(sp[m].percent)).join(" / ") + "%",
          value: MACROS.map((m) => n0(sp[m].grams)).join(" / "),
          unit: "g",
          emphasize: g === goal,
        };
      }),
    },
  ];

  const parts = MACROS.map((m) => ({
    key: m,
    color: COLORS[m],
    percent: snap[m].percent,
    grams: snap[m].grams,
    label: `${SYMBOL[m]} ${n0(snap[m].grams)} g · ${n1(snap[m].percent)}%`,
  }));

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { kcal: `${n0(kcal)} kcal` })}
      drawing={
        <Scene3D className="min-h-0!" camera={[0, 2.6, 3.9]}>
          <MacroPlateScene3D parts={parts} total={`${n0(kcal)} kcal`} />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard
      title={t("heading")}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={<MacroShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={t("heading")} heroValue={`${n0(kcal)} kcal`} sentence={sentence} />}
    >
      {invalid && (
        <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {t("invalidCalories")}
        </p>
      )}
      <div ref={wrapRef} className={fill ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
        {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
      </div>
    </SectionCard>
  );
}
