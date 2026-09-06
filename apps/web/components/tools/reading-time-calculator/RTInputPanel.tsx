"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { READING_SPEED_PRESETS } from "./types";
import type { ReadingSpeedPreset } from "./types";

const PRESETS: ReadingSpeedPreset[] = ["slow", "average", "fast", "custom"];

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  preset: ReadingSpeedPreset;
  onPresetChange: (value: ReadingSpeedPreset) => void;
  customWpm: string;
  onCustomWpmChange: (value: string) => void;
};

export default function RTInputPanel({ text, onTextChange, preset, onPresetChange, customWpm, onCustomWpmChange }: Props) {
  const t = useTranslations("tools.reading-time-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="sr-only">{t("textLabel")}</span>
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("textPlaceholder")}
          rows={8}
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>

      <div className="mt-4">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("speedLabel")}</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPresetChange(p)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                preset === p
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t(`presets.${p}`)}
              {p !== "custom" && <span dir="ltr" className="ms-1 opacity-70">({READING_SPEED_PRESETS[p]})</span>}
            </button>
          ))}
        </div>
      </div>

      {preset === "custom" && (
        <div className="mt-4">
          <ToolInput
            label={t("customWpmLabel")}
            type="text"
            inputMode="numeric"
            value={customWpm}
            onChange={(e) => onCustomWpmChange(e.target.value)}
          />
        </div>
      )}
    </SectionCard>
  );
}
