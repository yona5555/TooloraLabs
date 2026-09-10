"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { SAMPLE_TEXT, SPEECH_PACE_PRESETS } from "./types";
import type { SpeechPacePreset } from "./types";

const PRESETS: SpeechPacePreset[] = ["formal", "normal", "fast", "custom"];

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  preset: SpeechPacePreset;
  onPresetChange: (value: SpeechPacePreset) => void;
  customWpm: string;
  onCustomWpmChange: (value: string) => void;
  onClear: () => void;
};

export default function SWInputPanel({ text, onTextChange, preset, onPresetChange, customWpm, onCustomWpmChange, onClear }: Props) {
  const t = useTranslations("tools.speech-word-count-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-3">
        <button
          type="button"
          onClick={() => onTextChange(SAMPLE_TEXT)}
          className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
        >
          {t("loadSampleText")}
        </button>
      </div>
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
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("paceLabel")}</span>
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
              {p !== "custom" && <span dir="ltr" className="ms-1 opacity-70">({SPEECH_PACE_PRESETS[p]})</span>}
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
