"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import TDEEEnergyGauge from "./TDEEEnergyGauge";
import type { GoalDirection } from "./types";

type TDEEResultProps = {
  bmr: number;
  tdee: number;
  goalDirection: GoalDirection;
  onGoalDirectionChange: (direction: GoalDirection) => void;
  weeklyRateKg: string;
  onWeeklyRateKgChange: (value: string) => void;
  dailyCalorieTarget: number;
  adjustmentPercentOfTDEE: number;
  dailyAdjustment: number;
  isAggressive: boolean;
  digitStyle: DigitStyle;
};

export default function TDEEResult({
  bmr,
  tdee,
  goalDirection,
  onGoalDirectionChange,
  weeklyRateKg,
  onWeeklyRateKgChange,
  dailyCalorieTarget,
  adjustmentPercentOfTDEE,
  dailyAdjustment,
  isAggressive,
  digitStyle,
}: TDEEResultProps) {
  const t = useTranslations("tools.tdee-calculator");

  const kcal = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 })} ${t("aboveFold.kcalUnit")}`;
  const signedAdjustmentPercent = goalDirection === "lose" ? -adjustmentPercentOfTDEE : goalDirection === "gain" ? adjustmentPercentOfTDEE : 0;

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.bmrLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatLocalizedNumber(bmr, digitStyle, { maximumFractionDigits: 0 })}
          </dd>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-500/10">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.tdeeLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">
            {formatLocalizedNumber(tdee, digitStyle, { maximumFractionDigits: 0 })}
          </dd>
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("aboveFold.goalLabel")}</span>
        <div className="grid grid-cols-3 gap-2">
          {(["lose", "maintain", "gain"] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => onGoalDirectionChange(direction)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
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
            <ToolInput
              label={t("aboveFold.weeklyRateLabel")}
              type="text"
              inputMode="decimal"
              value={weeklyRateKg}
              onChange={(e) => onWeeklyRateKgChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.dailyTargetLabel")}</p>
        <p dir="ltr" className="text-center font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {kcal(dailyCalorieTarget)}
        </p>

        <div className="mt-4">
          <TDEEEnergyGauge
            adjustmentPercent={signedAdjustmentPercent}
            labels={{
              aggressiveDeficit: t("gauge.aggressiveDeficit"),
              moderateDeficit: t("gauge.moderateDeficit"),
              maintenance: t("gauge.maintenance"),
              moderateSurplus: t("gauge.moderateSurplus"),
              aggressiveSurplus: t("gauge.aggressiveSurplus"),
              yourGoal: t("aboveFold.goalLabel"),
            }}
          />
        </div>

        {isAggressive && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            {t("aboveFold.aggressiveWarning")}
          </p>
        )}

        {goalDirection !== "maintain" && !isAggressive && (
          <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t("aboveFold.adjustmentNote", { amount: kcal(Math.abs(dailyAdjustment)) })}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
