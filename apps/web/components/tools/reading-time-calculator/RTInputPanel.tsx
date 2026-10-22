"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { READING_SPEED_PRESETS } from "./types";
import type { ReadingSpeedPreset } from "./types";
import { readerWordIndex } from "./rtMath";
import { useRtLive } from "./RtLiveContext";

const PRESETS: ReadingSpeedPreset[] = ["slow", "average", "fast", "custom"];

// Identical box metrics for the textarea and its highlight backdrop so the marks sit under the right letters.
const BOX = "[scrollbar-gutter:stable] px-4 py-3 text-base leading-7 whitespace-pre-wrap break-words [overflow-wrap:anywhere]";

export default function RTInputPanel({ sampleText }: { sampleText: string }) {
  const t = useTranslations("tools.reading-time-calculator.form");
  const tl = useTranslations("tools.reading-time-calculator.live");
  const { wpm, text, setText, preset, setPreset, customWpm, setCustomWpm, reset, tokens, reader, setReader, textareaRef, result, ok, f, clock } = useRtLive();
  const backdropRef = useRef<HTMLDivElement>(null);

  const readerIdx = reader && ok ? readerWordIndex(reader.seconds, reader.wpm, tokens.length) : -1;
  const readerTok = readerIdx >= 0 ? tokens[readerIdx] : undefined;

  const syncScroll = () => {
    if (backdropRef.current && textareaRef.current) backdropRef.current.scrollTop = textareaRef.current.scrollTop;
  };
  useEffect(syncScroll, [readerTok, text, textareaRef]);

  return (
    <SectionCard title={t("inputTitle")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setText(sampleText)}
          className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
        >
          {t("loadSampleText")}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:text-sm"
        >
          <RotateCcw size={14} />
          {t("clear")}
        </button>
        {readerTok && (
          <button
            type="button"
            onClick={() => setReader(null)}
            className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
          >
            <span dir="auto">{tl("following", { time: clock(reader?.seconds ?? 0) })}</span>
            <X size={12} />
          </button>
        )}
      </div>

      <label className="relative block rounded-xl border border-zinc-300 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/20 lg:flex lg:flex-1">
        <span className="sr-only">{t("textLabel")}</span>
        {readerTok && (
          <div ref={backdropRef} aria-hidden dir="auto" className={`pointer-events-none absolute inset-0 overflow-hidden text-transparent ${BOX}`}>
            <mark className="rounded-sm bg-blue-200/70 text-transparent dark:bg-blue-500/25">{text.slice(0, readerTok.start)}</mark>
            <mark className="rounded-sm bg-amber-300 text-transparent dark:bg-amber-400/60">{text.slice(readerTok.start, readerTok.end)}</mark>
            {text.slice(readerTok.end) + "\n"}
          </div>
        )}
        <textarea
          ref={textareaRef}
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onScroll={syncScroll}
          placeholder={t("textPlaceholder")}
          rows={12}
          className={`relative block min-h-[16rem] w-full resize-none overflow-y-auto rounded-xl bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 selection:bg-blue-300/70 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:selection:bg-blue-500/50 lg:flex-1 ${BOX}`}
        />
      </label>
      <p dir="auto" className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {tl("inputFooter", { words: f(result.wordCount), wpm: f(wpm) })}
      </p>

      <div className="mt-4">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("speedLabel")}</span>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={preset === p}
              onClick={() => setPreset(p)}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition sm:text-sm ${
                preset === p
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t(`presets.${p}`)}
              {p !== "custom" && <span dir="ltr" className="ms-1 opacity-70">({f(READING_SPEED_PRESETS[p])})</span>}
            </button>
          ))}
        </div>
      </div>

      {preset === "custom" && (
        <div className="mt-4">
          <ToolInput label={t("customWpmLabel")} type="text" inputMode="numeric" value={customWpm} onChange={(e) => setCustomWpm(e.target.value)} />
        </div>
      )}
    </SectionCard>
  );
}
