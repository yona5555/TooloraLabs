"use client";
import { useTranslations } from "next-intl";
import type { Gender, BMRFormula } from "./types";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import BMRFormulaTabs from "./BMRFormulaTabs";

type Props = {
  gender: Gender;
  onGenderChange: (value: Gender) => void;
  weightKg: string;
  onWeightKgChange: (value: string) => void;
  heightCm: string;
  onHeightCmChange: (value: string) => void;
  age: string;
  onAgeChange: (value: string) => void;
  formula: BMRFormula;
  onFormulaChange: (formula: BMRFormula) => void;
};

export default function BMRInputPanel({
  gender,
  onGenderChange,
  weightKg,
  onWeightKgChange,
  heightCm,
  onHeightCmChange,
  age,
  onAgeChange,
  formula,
  onFormulaChange,
}: Props) {
  const t = useTranslations("tools.bmr-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("genderLabel")}</span>
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
                {value === "male" ? t("genderMale") : t("genderFemale")}
              </label>
            ))}
          </div>
        </div>

        <ToolInput label={t("weight")} type="text" inputMode="decimal" value={weightKg} onChange={(e) => onWeightKgChange(e.target.value)} />
        <ToolInput label={t("height")} type="text" inputMode="decimal" value={heightCm} onChange={(e) => onHeightCmChange(e.target.value)} />
        <ToolInput label={t("age")} type="text" inputMode="numeric" value={age} onChange={(e) => onAgeChange(e.target.value)} />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("formulaLabel")}</span>
          <BMRFormulaTabs formula={formula} onFormulaChange={onFormulaChange} />
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t(`hints.${formula}`)}</p>
    </SectionCard>
  );
}
