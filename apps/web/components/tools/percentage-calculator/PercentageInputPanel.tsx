"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { PercentageMode } from "./types";

const MODES: PercentageMode[] = [
  "percent-of-number",
  "what-percent",
  "percentage-change",
  "reverse-percentage",
  "percentage-difference",
];

type PercentageInputPanelProps = {
  mode: PercentageMode;
  onModeChange: (mode: PercentageMode) => void;
  first: string;
  onFirstChange: (value: string) => void;
  second: string;
  onSecondChange: (value: string) => void;
};

export default function PercentageInputPanel({
  mode,
  onModeChange,
  first,
  onFirstChange,
  second,
  onSecondChange,
}: PercentageInputPanelProps) {
  const t = useTranslations("tools.percentage-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as PercentageMode)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          {MODES.map((m) => (
            <option key={m} value={m}>
              {t(`mode.${m}`)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 space-y-5">
        <ToolInput
          label={t(`firstLabel.${mode}`)}
          type="text"
          inputMode="decimal"
          placeholder={t("firstPlaceholder")}
          value={first}
          onChange={(e) => onFirstChange(e.target.value)}
        />
        <ToolInput
          label={t(`secondLabel.${mode}`)}
          type="text"
          inputMode="decimal"
          placeholder={t("secondPlaceholder")}
          value={second}
          onChange={(e) => onSecondChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
