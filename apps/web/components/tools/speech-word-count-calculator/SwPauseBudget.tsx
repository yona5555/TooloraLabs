"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SwIndicatorCard from "./SwIndicatorCard";
import { useSwLive } from "./SwLiveContext";

/** Stacked Bar with sliders (§31 #12): a what-if for planned pauses — speaking time plus a pause after each sentence and each paragraph break. The calculator's own estimate stays pause-free. */
export default function SwPauseBudget() {
  const t = useTranslations("tools.speech-word-count-calculator.live.pauses");
  const { result, sentences, paragraphs, secondsFor, f, pct, clock, timeLabel } = useSwLive();
  const [sentencePause, setSentencePause] = useState(0.5);
  const [paragraphPause, setParagraphPause] = useState(2);
  const speaking = secondsFor(result.wordCount);
  const breaks = Math.max(0, paragraphs.length - 1);
  const sentenceSec = sentences.length * sentencePause;
  const paragraphSec = breaks * paragraphPause;
  const total = speaking + sentenceSec + paragraphSec;
  const parts = [
    { key: "speaking", sec: speaking, bar: "bg-blue-600 dark:bg-blue-500", dot: "bg-blue-600 dark:bg-blue-500" },
    { key: "sentencePauses", sec: sentenceSec, bar: "bg-amber-400 dark:bg-amber-400", dot: "bg-amber-400" },
    { key: "paragraphPauses", sec: paragraphSec, bar: "bg-violet-500 dark:bg-violet-400", dot: "bg-violet-500 dark:bg-violet-400" },
  ] as const;

  const indicator = (
    <div className="w-full space-y-3 sm:w-[330px]">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t("withPauses")}</span>
        <span dir="ltr" className="font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">{clock(total)}</span>
      </div>
      <div dir="ltr" className="flex h-6 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {parts.map((p) => (
          <div key={p.key} className={p.bar} style={{ width: `${total > 0 ? (p.sec / total) * 100 : 0}%`, transition: "width 300ms ease" }} title={`${t(p.key)} · ${clock(p.sec)}`} />
        ))}
      </div>
      <ul className="space-y-0.5 text-xs">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${p.dot}`} />
              {t(p.key)}
            </span>
            <span dir="ltr" className="font-mono font-semibold">{clock(p.sec)}</span>
          </li>
        ))}
      </ul>
      <label className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="w-36 shrink-0">{t("sentencePause", { s: f(sentencePause, 2) })}</span>
        <input type="range" min={0} max={3} step={0.25} value={sentencePause} onChange={(e) => setSentencePause(Number(e.target.value))} className="w-full accent-amber-500" aria-label={t("sentencePauseLabel")} />
      </label>
      <label className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="w-36 shrink-0">{t("paragraphPause", { s: f(paragraphPause, 2) })}</span>
        <input type="range" min={0} max={6} step={0.5} value={paragraphPause} onChange={(e) => setParagraphPause(Number(e.target.value))} className="w-full accent-violet-600" aria-label={t("paragraphPauseLabel")} />
      </label>
    </div>
  );

  return (
    <SwIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("speaking"), value: clock(speaking), note: t("calculatorNote") },
        { label: t("sentencePauses"), value: clock(sentenceSec), note: `${f(sentences.length)} × ${f(sentencePause, 2)}` },
        { label: t("paragraphPauses"), value: clock(paragraphSec), note: `${f(breaks)} × ${f(paragraphPause, 2)}` },
        { label: t("pauseShare"), value: pct(total > 0 ? (sentenceSec + paragraphSec) / total : 0) },
        { label: t("withPauses"), value: timeLabel(total), emphasize: true },
      ]}
    />
  );
}
