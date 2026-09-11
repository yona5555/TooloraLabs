"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { MultiplicationTableMode } from "./types";

type Props = {
  mode: MultiplicationTableMode;
  onModeChange: (value: MultiplicationTableMode) => void;
  number: string;
  onNumberChange: (value: string) => void;
  maxMultiplier: string;
  onMaxMultiplierChange: (value: string) => void;
  rangeStart: string;
  onRangeStartChange: (value: string) => void;
  rangeEnd: string;
  onRangeEndChange: (value: string) => void;
  onClear: () => void;
};

export default function MTInputPanel({
  mode,
  onModeChange,
  number,
  onNumberChange,
  maxMultiplier,
  onMaxMultiplierChange,
  rangeStart,
  onRangeStartChange,
  rangeEnd,
  onRangeEndChange,
  onClear,
}: Props) {
  const t = useTranslations("tools.multiplication-table-generator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange("single")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
            mode === "single"
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {t("modeSingle")}
        </button>
        <button
          type="button"
          onClick={() => onModeChange("range")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
            mode === "range"
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {t("modeRange")}
        </button>
      </div>

      {mode === "single" ? (
        <div className="grid grid-cols-2 gap-3">
          <ToolInput
            label={t("numberLabel")}
            type="text"
            inputMode="numeric"
            value={number}
            onChange={(e) => onNumberChange(e.target.value)}
          />
          <ToolInput
            label={t("maxMultiplierLabel")}
            type="text"
            inputMode="numeric"
            value={maxMultiplier}
            onChange={(e) => onMaxMultiplierChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ToolInput
            label={t("rangeStartLabel")}
            type="text"
            inputMode="numeric"
            value={rangeStart}
            onChange={(e) => onRangeStartChange(e.target.value)}
          />
          <ToolInput
            label={t("rangeEndLabel")}
            type="text"
            inputMode="numeric"
            value={rangeEnd}
            onChange={(e) => onRangeEndChange(e.target.value)}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}
