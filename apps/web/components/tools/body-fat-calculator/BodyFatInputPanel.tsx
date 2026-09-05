"use client";
import { useTranslations } from "next-intl";
import type { Gender } from "./types";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  gender: Gender;
  onGenderChange: (value: Gender) => void;
  heightCm: string;
  onHeightCmChange: (value: string) => void;
  neckCm: string;
  onNeckCmChange: (value: string) => void;
  waistCm: string;
  onWaistCmChange: (value: string) => void;
  hipCm: string;
  onHipCmChange: (value: string) => void;
};

export default function BodyFatInputPanel({
  gender,
  onGenderChange,
  heightCm,
  onHeightCmChange,
  neckCm,
  onNeckCmChange,
  waistCm,
  onWaistCmChange,
  hipCm,
  onHipCmChange,
}: Props) {
  const t = useTranslations("tools.body-fat-calculator.form");

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

        <ToolInput label={t("height")} type="text" inputMode="decimal" value={heightCm} onChange={(e) => onHeightCmChange(e.target.value)} />
        <ToolInput label={t("neck")} type="text" inputMode="decimal" value={neckCm} onChange={(e) => onNeckCmChange(e.target.value)} />
        <ToolInput label={t("waist")} type="text" inputMode="decimal" value={waistCm} onChange={(e) => onWaistCmChange(e.target.value)} />
        {gender === "female" && (
          <ToolInput label={t("hip")} type="text" inputMode="decimal" value={hipCm} onChange={(e) => onHipCmChange(e.target.value)} />
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </SectionCard>
  );
}
