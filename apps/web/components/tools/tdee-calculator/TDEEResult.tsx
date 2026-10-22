"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import TDEEShareExportModal from "./TDEEShareExportModal";
import type { TDEESnapshot } from "./TDEELiveContext";
import { COLORS, LEVELS, TEF_SHARE, dailyFromWeekly, mult, splitOf } from "./energy";
import type { GoalDirection } from "./types";
import { useSnapTableRows } from "../ideal-weight-calculator/useSnapTableRows";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const TDEEEnergyScene3D = dynamic(() => import("./TDEEEnergyScene3D"), { ssr: false });

type TDEEResultProps = {
  /** The last valid result and the body it was computed from. */
  snap: TDEESnapshot;
  /** The current fields are invalid: the last good result stays, with a short note. */
  invalid: boolean;
  goalDirection: GoalDirection;
  onGoalDirectionChange: (direction: GoalDirection) => void;
  weeklyRateKg: string;
  onWeeklyRateKgChange: (value: string) => void;
  dailyCalorieTarget: number;
  adjustmentPercentOfTDEE: number;
  dailyAdjustment: number;
  isAggressive: boolean;
  digitStyle: DigitStyle;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

export default function TDEEResult({
  snap,
  invalid,
  goalDirection,
  onGoalDirectionChange,
  weeklyRateKg,
  onWeeklyRateKgChange,
  dailyCalorieTarget,
  adjustmentPercentOfTDEE,
  dailyAdjustment,
  isAggressive,
  digitStyle,
  fill = false,
}: TDEEResultProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useSnapTableRows(wrapRef);
  const t = useTranslations("tools.tdee-calculator");
  const tv = useTranslations("tools.tdee-calculator.visuals.result");

  const n0 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });
  const n1 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });
  const n2 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });
  const kcal = (value: number) => `${n0(value)} ${t("aboveFold.kcalUnit")}`;
  const unit = t("aboveFold.kcalUnit");
  const { bmr, tdee, weightKg: w, heightCm: h, age: a, gender, activityLevel, bodyFat } = snap;
  const m = mult(activityLevel);
  const split = splitOf(bmr, tdee);
  const sedentaryTdee = bmr * mult("sedentary");

  const inputRows = [
    { label: t("aboveFold.bmrLabel"), value: kcal(bmr) },
    { label: t("aboveFold.tdeeLabel"), value: kcal(tdee) },
    { label: t("aboveFold.goalLabel"), value: t(`aboveFold.goalDirection.${goalDirection}`) },
  ];
  const resultRows = [{ label: t("aboveFold.dailyTargetLabel"), value: kcal(dailyCalorieTarget) }];
  const sentence = t("aboveFold.sentence", { target: kcal(dailyCalorieTarget), tdee: kcal(tdee), goal: t(`aboveFold.goalDirection.${goalDirection}`) });

  const bmrFormula =
    bodyFat !== null
      ? `370 + 21.6 × ${n1(w)} × (1 − ${n1(bodyFat)}%)`
      : `10 × ${n1(w)} + 6.25 × ${n1(h)} − 5 × ${n0(a)} ${gender === "male" ? "+ 5" : "− 161"}`;
  const signedAdj = dailyAdjustment;
  const sign = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "");

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: t("form.weightLabel"), formula: tv("given"), value: n1(w), unit: "kg" },
        ...(bodyFat === null
          ? [
              { label: t("form.heightLabel"), formula: tv("given"), value: n1(h), unit: "cm" },
              { label: t("form.ageLabel"), formula: tv("given"), value: n0(a) },
              { label: t("form.genderLabel"), formula: tv("given"), value: gender === "male" ? t("form.genderMale") : t("form.genderFemale") },
            ]
          : [{ label: t("form.bodyFatLabel"), formula: tv("given"), value: `${n1(bodyFat)}%` }]),
        { label: tv("method"), formula: tv("given"), value: bodyFat !== null ? tv("methodKatch") : tv("methodMifflin") },
        { label: tv("multiplier"), formula: t(`form.activity.${activityLevel}`), value: `× ${n2(m)}` },
      ],
    },
    {
      title: tv("groupEnergy"),
      rows: [
        { label: t("aboveFold.bmrLabel"), formula: bmrFormula, value: n0(bmr), unit, emphasize: true },
        { label: t("aboveFold.tdeeLabel"), formula: `${n0(bmr)} × ${n2(m)}`, value: n0(tdee), unit, emphasize: true },
        { label: tv("tef"), formula: `${n0(tdee)} × ${n0(TEF_SHARE * 100)}%`, value: n0(split.tef), unit },
        { label: tv("neat"), formula: `${n0(sedentaryTdee)} × 0.9 − ${n0(bmr)}`, value: n0(split.neat), unit },
        { label: tv("eat"), formula: `${n0(tdee)} − ${n0(split.bmr)} − ${n0(split.tef)} − ${n0(split.neat)}`, value: n0(split.eat), unit },
        { label: tv("perHour"), formula: `${n0(tdee)} ÷ 24`, value: n0(tdee / 24), unit: "kcal/h" },
      ],
    },
    {
      title: tv("groupLevels"),
      rows: LEVELS.map((level) => ({
        label: t(`form.activity.${level}`),
        formula: `${n0(bmr)} × ${n2(mult(level))}`,
        value: n0(bmr * mult(level)),
        unit,
        emphasize: level === activityLevel,
      })),
    },
    {
      title: tv("groupGoals"),
      rows: [
        { label: tv("cut"), formula: `${n0(tdee)} − ${n0(dailyFromWeekly(0.5))}`, value: n0(tdee - dailyFromWeekly(0.5)), unit },
        { label: tv("maintain"), formula: `= ${t("aboveFold.tdeeLabel")}`, value: n0(tdee), unit },
        { label: tv("bulk"), formula: `${n0(tdee)} + ${n0(dailyFromWeekly(0.25))}`, value: n0(tdee + dailyFromWeekly(0.25)), unit },
        {
          label: t("aboveFold.dailyTargetLabel"),
          formula: `${n0(tdee)} ${signedAdj < 0 ? "−" : "+"} ${n1(Math.abs(snap.weeklyKg))} × 7700 ÷ 7`,
          value: n0(dailyCalorieTarget),
          unit,
          emphasize: true,
        },
        { label: tv("adjustPct"), formula: `${n0(Math.abs(signedAdj))} ÷ ${n0(tdee)}`, value: `${sign(signedAdj)}${n1(adjustmentPercentOfTDEE)}%` },
        { label: tv("monthly"), formula: `${sign(snap.weeklyKg)}${n1(Math.abs(snap.weeklyKg))} × 30 ÷ 7`, value: `${sign(snap.weeklyKg)}${n1((Math.abs(snap.weeklyKg) * 30) / 7)}`, unit: "kg" },
      ],
    },
  ];

  const parts = [
    { key: "bmr", kcal: split.bmr, color: COLORS.bmr, label: `BMR ${n0(split.bmr)}` },
    { key: "tef", kcal: split.tef, color: COLORS.tef, label: `TEF ${n0(split.tef)}` },
    { key: "neat", kcal: split.neat, color: COLORS.neat, label: `NEAT ${n0(split.neat)}` },
    { key: "eat", kcal: split.eat, color: COLORS.eat, label: `EAT ${n0(split.eat)}` },
  ];
  const gap = dailyCalorieTarget - tdee;

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { tdee: kcal(tdee), target: kcal(dailyCalorieTarget) })}
      drawing={
        <Scene3D className="min-h-0!" camera={[1.2, 1.1, 4.6]}>
          <TDEEEnergyScene3D
            parts={parts}
            tdee={tdee}
            intake={dailyCalorieTarget}
            intakeColor={COLORS.intake}
            multiplier={m}
            labels={{ tdee: `TDEE ${n0(tdee)}`, intake: `${n0(dailyCalorieTarget)} kcal`, gap: `${sign(gap)}${n0(Math.abs(gap))}` }}
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
        <TDEEShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={t("aboveFold.dailyTargetLabel")} heroValue={kcal(dailyCalorieTarget)} sentence={sentence} />
      }
    >
      {invalid && (
        <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {tv("keptLast")}
        </p>
      )}

      <div className="mb-4">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("aboveFold.goalLabel")}</span>
        <div className="grid grid-cols-3 gap-2">
          {(["lose", "maintain", "gain"] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => onGoalDirectionChange(direction)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                goalDirection === direction
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {t(`aboveFold.goalDirection.${direction}`)}
            </button>
          ))}
        </div>
        {goalDirection !== "maintain" && (
          <div className="mt-3">
            <ToolInput label={t("aboveFold.weeklyRateLabel")} type="text" inputMode="decimal" value={weeklyRateKg} onChange={(e) => onWeeklyRateKgChange(e.target.value)} />
          </div>
        )}
        {isAggressive && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            {t("aboveFold.aggressiveWarning")}
          </p>
        )}
        {goalDirection !== "maintain" && !isAggressive && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.adjustmentNote", { amount: kcal(Math.abs(dailyAdjustment)) })}</p>
        )}
      </div>

      <div ref={wrapRef} className={fill ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
        {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
      </div>
    </SectionCard>
  );
}
