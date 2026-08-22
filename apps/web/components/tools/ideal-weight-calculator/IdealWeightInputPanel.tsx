"use client";
import { useTranslations } from "next-intl";
import type { Gender } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type IdealWeightInputPanelProps = {
  gender: Gender;
  onGenderChange: (value: Gender) => void;
  heightCm: string;
  onHeightCmChange: (value: string) => void;
};

export default function IdealWeightInputPanel({
  gender,
  onGenderChange,
  heightCm,
  onHeightCmChange,
}: IdealWeightInputPanelProps) {
  const t = useTranslations("tools.ideal-weight-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="space-y-5">
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

        <ToolInput
          label={t("form.heightLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.heightPlaceholder")}
          value={heightCm}
          onChange={(e) => onHeightCmChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
