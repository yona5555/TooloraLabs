"use client";
import { useTranslations } from "next-intl";
import { LOREM_COUNT_RANGE } from "@tooloralabs/tools";
import { RefreshCw, RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { LOREM_UNITS, LOREM_STYLES } from "./types";
import { useLiLive } from "./LiLiveContext";

export default function LoremInputPanel() {
  const t = useTranslations("tools.lorem-ipsum-generator.form");
  const tl = useTranslations("tools.lorem-ipsum-generator.live");
  const { unit, setUnit, count, setCount, countValue, style, setStyle, startWithLorem, setStartWithLorem, regenerate, reset, ok, result, analysis, f } = useLiLive();
  const sliderValue = Math.min(LOREM_COUNT_RANGE.max, Math.max(LOREM_COUNT_RANGE.min, Math.round(countValue) || LOREM_COUNT_RANGE.min));

  return (
    <SectionCard phoneRole="input" title={t("inputTitle")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col">
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("styleLabel")}</span>
          <div className="grid grid-cols-2 gap-2">
            {LOREM_STYLES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={style === s}
                onClick={() => setStyle(s)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  style === s
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {t(`styles.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unitLabel")}</span>
          <div className="grid grid-cols-3 gap-1.5">
            {LOREM_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={unit === u}
                onClick={() => setUnit(u)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition sm:text-sm ${
                  unit === u
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {t(`units.${u}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <ToolInput label={t("countLabel")} type="text" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
          <label className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span dir="ltr" className="w-6 shrink-0 font-mono">{f(LOREM_COUNT_RANGE.min)}</span>
            <input
              type="range"
              min={LOREM_COUNT_RANGE.min}
              max={LOREM_COUNT_RANGE.max}
              step={1}
              value={sliderValue}
              onChange={(e) => setCount(f(Number(e.target.value)))}
              aria-label={t("countLabel")}
              className="w-full accent-blue-600"
            />
            <span dir="ltr" className="w-6 shrink-0 text-end font-mono">{f(LOREM_COUNT_RANGE.max)}</span>
          </label>
        </div>

        {style === "classic" && (
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-blue-600 dark:border-zinc-600"
            />
            {t("startWithLorem")}
          </label>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={regenerate}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            {t("generate")}
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={16} />
            {t("clear")}
          </button>
        </div>
      </div>

      <p dir="auto" className="mt-4 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400 lg:mt-auto">
        {ok
          ? tl("inputFooter", { words: f(result.wordCount), sentences: f(analysis.sentences.length), paragraphs: f(analysis.paragraphs.length) })
          : tl("inputHint")}
      </p>
    </SectionCard>
  );
}
