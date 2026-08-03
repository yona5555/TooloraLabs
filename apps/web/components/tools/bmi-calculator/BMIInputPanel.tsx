import { useTranslations } from "next-intl";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { Gender } from "@tooloralabs/tools";
import type { UnitSystem } from "./types";

type BMIInputPanelProps = {
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
  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function BMIInputPanel({
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
  error,
  onSubmit,
  onReset,
}: BMIInputPanelProps) {
  const t = useTranslations("tools.bmi-calculator");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onUnitSystemChange("metric")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            unitSystem === "metric"
              ? "bg-blue-600 text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {t("form.unitMetric")}
        </button>
        <button
          type="button"
          onClick={() => onUnitSystemChange("us")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            unitSystem === "us"
              ? "bg-blue-600 text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {t("form.unitUS")}
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        {unitSystem === "metric" ? (
          <ToolInput
            type="text"
            inputMode="decimal"
            placeholder={t("form.heightPlaceholder")}
            value={heightCm}
            onChange={(e) => onHeightCmChange(e.target.value)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <ToolInput
              type="text"
              inputMode="decimal"
              placeholder={t("form.heightFeetPlaceholder")}
              value={heightFt}
              onChange={(e) => onHeightFtChange(e.target.value)}
            />
            <ToolInput
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
            type="text"
            inputMode="decimal"
            placeholder={t("form.weightPlaceholder")}
            value={weightKg}
            onChange={(e) => onWeightKgChange(e.target.value)}
          />
        ) : (
          <ToolInput
            type="text"
            inputMode="decimal"
            placeholder={t("form.weightLbPlaceholder")}
            value={weightLb}
            onChange={(e) => onWeightLbChange(e.target.value)}
          />
        )}

        <ToolInput
          type="text"
          inputMode="numeric"
          placeholder={t("form.agePlaceholder")}
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.genderLabel")}
          </span>
          <div className="flex gap-3">
            {(["male", "female"] as const).map((value) => (
              <label
                key={value}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  gender === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={value}
                  checked={gender === value}
                  onChange={() => onGenderChange(value)}
                  className="sr-only"
                />
                {value === "male" ? t("form.genderMale") : t("form.genderFemale")}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("form.calculate")}</ToolButton>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("form.reset")}
          </button>
        </div>
      </form>
    </div>
  );
}
