"use client";
import { useTranslations } from "next-intl";
import SwIndicatorCard from "./SwIndicatorCard";
import { spanAt } from "./swMath";
import { useSwLive } from "./SwLiveContext";

const MAX_MARKS = 10;
const PREVIEW_WORDS = 4;
const MARK_STEPS = [30, 60, 120, 300, 600, 900, 1800, 3600];

/** Cue Sheet / Timeline with Stations (§31 #9): the word you should be saying at each time mark; click a mark to select that word in the text. */
export default function SwMinuteMarks() {
  const t = useTranslations("tools.speech-word-count-calculator.live.marks");
  const { text, tokens, paragraphs, wpm, secondsFor, active, jumpTo, f, clock } = useSwLive();
  const words = tokens.length;
  const total = secondsFor(words);
  const every = MARK_STEPS.find((s) => total / s <= MAX_MARKS) ?? Math.ceil(total / MAX_MARKS / 3600) * 3600;
  const perMark = (every / 60) * wpm;
  const marks = Array.from({ length: Math.floor(total / every) }, (_, i) => {
    const sec = (i + 1) * every;
    const index = Math.min(words - 1, Math.floor((sec * wpm) / 60));
    return { sec, index };
  }).filter((m) => m.index >= 0 && m.index < words);
  const selected = active?.kind === "word" ? marks.find((m) => m.index === active.index) : undefined;
  const focus = selected ?? marks[0];
  const preview = (index: number) => {
    const last = tokens[Math.min(words - 1, index + PREVIEW_WORDS - 1)];
    return text.slice(tokens[index].start, last.end);
  };

  const indicator = (
    <div className="w-full sm:w-[340px]">
      {marks.length === 0 ? (
        <p className="rounded-lg bg-zinc-50 px-3 py-4 text-center text-sm text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">{t("none", { clock: clock(every) })}</p>
      ) : (
        <ol className="relative space-y-1 border-s-2 border-blue-200 ps-3 dark:border-blue-500/30">
          {marks.map((m) => {
            const on = selected === m;
            const para = spanAt(paragraphs, m.index);
            return (
              <li key={m.sec} className="relative">
                <span className={`absolute -start-[19px] top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${on ? "bg-amber-400" : "bg-blue-600 dark:bg-blue-500"}`} />
                <button
                  type="button"
                  onClick={() => jumpTo(tokens[m.index].start, tokens[Math.min(words - 1, m.index + PREVIEW_WORDS - 1)].end, { kind: "word", index: m.index })}
                  className={`flex w-full items-baseline gap-2 rounded-md px-2 py-1 text-start transition ${on ? "bg-amber-50 ring-1 ring-amber-400 dark:bg-amber-500/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  <span dir="ltr" className="w-12 shrink-0 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">{clock(m.sec)}</span>
                  <span dir="auto" className="min-w-0 flex-1 truncate text-sm text-zinc-800 dark:text-zinc-100">“{preview(m.index)}…”</span>
                  {para && <span className="shrink-0 text-xs text-zinc-400">¶{f(para.index + 1)}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{t("hint")}</p>
    </div>
  );

  return (
    <SwIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("every"), value: clock(every) },
        { label: t("perMark"), value: f(perMark, 0), note: `${f(every / 60, 2)} × ${f(wpm)}` },
        { label: t("count"), value: f(marks.length) },
        ...(focus
          ? [
              { label: t("at", { clock: clock(focus.sec) }), value: t("wordN", { n: f(focus.index + 1) }), emphasize: true, note: `${clock(focus.sec)} × ${f(wpm)} ÷ ${f(60)}` },
            ]
          : []),
        { label: t("end"), value: clock(total) },
      ]}
    />
  );
}
