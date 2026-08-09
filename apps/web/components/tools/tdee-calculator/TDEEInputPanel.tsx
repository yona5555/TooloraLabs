"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { ActivityLevel, Gender, UnitSystem } from "./types";

type TDEEInputPanelProps = {
  unitSystem: UnitSystem;
  onUnitSystemChange: (system: UnitSystem) => void;
  heightCm: string;
  onHeightCmChange: (value: string) => void;
  weightKg: string;
  onWeightKgChange: (value: string) => void;
  heightFt: string;
  onHeightFtChange: (value: string) => void;
  heightIn: string;
  onHeightInChange: (value: string) => void;
  weightLb: string;
  onWeightLbChange: (value: string) => void;
  age: string;
  onAgeChange: (value: string) => void;
  gender: Gender;
  onGenderChange: (value: Gender) => void;
  activityLevel: ActivityLevel;
  onActivityLevelChange: (value: ActivityLevel) => void;
  useBodyFat: boolean;
  onUseBodyFatChange: (value: boolean) => void;
  bodyFatPercent: string;
  onBodyFatPercentChange: (value: string) => void;
};

const ACTIVITY_LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "veryActive"];

export default function TDEEInputPanel({
  unitSystem,
  onUnitSystemChange,
  heightCm,
  onHeightCmChange,
  weightKg,
  onWeightKgChange,
  heightFt,
  onHeightFtChange,
  heightIn,
  onHeightInChange,
  weightLb,
  onWeightLbChange,
  age,
  onAgeChange,
  gender,
  onGenderChange,
  activityLevel,
  onActivityLevelChange,
  useBodyFat,
  onUseBodyFatChange,
  bodyFatPercent,
  onBodyFatPercentChange,
}: TDEEInputPanelProps) {
  const t = useTranslations("tools.tdee-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["metric", "us"] as const).map((system) => (
          <button
            key={system}
            type="button"
            onClick={() => onUnitSystemChange(system)}
            className={`rounded-md px-3 py-3 text-sm font-medium transition ${
              unitSystem === system
                ? "bg-blue-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {system === "metric" ? t("form.unitMetric") : t("form.unitUS")}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {unitSystem === "metric" ? (
          <ToolInput
            label={t("form.heightLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.heightPlaceholder")}
            value={heightCm}
            onChange={(e) => onHeightCmChange(e.target.value)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <ToolInput
              label={t("form.heightLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.heightFeetPlaceholder")}
              value={heightFt}
              onChange={(e) => onHeightFtChange(e.target.value)}
            />
            <ToolInput
              label="&nbsp;"
              type="text"
              inputMode="decimal"
              placeholder={t("form.heightInchesPlaceholder")}
              value={heightIn}
              onChange={(e) => onHeightInChange(e.target.value)}
            />
          </div>
        )}

        {unitSystem === "metric" ? (
          <ToolInput
            label={t("form.weightLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.weightPlaceholder")}
            value={weightKg}
            onChange={(e) => onWeightKgChange(e.target.value)}
          />
        ) : (
          <ToolInput
            label={t("form.weightLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.weightLbPlaceholder")}
            value={weightLb}
            onChange={(e) => onWeightLbChange(e.target.value)}
          />
        )}

        <ToolInput
          label={t("form.ageLabel")}
          type="text"
          inputMode="numeric"
          placeholder={t("form.agePlaceholder")}
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.genderLabel")}</span>
          <div className="flex gap-3">
            {(["male", "female"] as const).map((value) => (
              <label
                key={value}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  gender === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                <input type="radio" name="gender" value={value} checked={gender === value} onChange={() => onGenderChange(value)} className="sr-only" />
                {value === "male" ? t("form.genderMale") : t("form.genderFemale")}
              </label>
            ))}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.activityLabel")}</span>
          <select
            value={activityLevel}
            onChange={(e) => onActivityLevelChange(e.target.value as ActivityLevel)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          >
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {t(`form.activity.${level}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={useBodyFat}
              onChange={(e) => onUseBodyFatChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
            />
            {t("form.useBodyFatLabel")}
          </label>
          {useBodyFat && (
            <div className="mt-3">
              <ToolInput
                label={t("form.bodyFatLabel")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.bodyFatPlaceholder")}
                value={bodyFatPercent}
                onChange={(e) => onBodyFatPercentChange(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
