"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { READING_WPM, SPEAKING_WPM } from "@tooloralabs/tools";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";

type Lane = { key: "reading" | "speaking"; wpm: number; set: (v: number) => void; min: number; max: number; bar: string; accent: string };

/** Side-by-Side Equivalence (§31 #11): the same word count as silent-reading time vs speaking time, with draggable pace sliders. */
export default function WcReadSpeak() {
  const t = useTranslations("tools.word-counter.live.readSpeak");
  const { stats, f, clock } = useWcLive();
  const [readWpm, setReadWpm] = useState(READING_WPM);
  const [speakWpm, setSpeakWpm] = useState(SPEAKING_WPM);
  const words = stats.words;
  const secs = (wpm: number) => (words / wpm) * 60;
  const longest = Math.max(secs(readWpm), secs(speakWpm), 1);

  const lanes: Lane[] = [
    { key: "reading", wpm: readWpm, set: setReadWpm, min: 100, max: 400, bar: "bg-blue-600 dark:bg-blue-500", accent: "accent-blue-600" },
    { key: "speaking", wpm: speakWpm, set: setSpeakWpm, min: 90, max: 200, bar: "bg-violet-600 dark:bg-violet-500", accent: "accent-violet-600" },
  ];

  const indicator = (
    <div className="w-full space-y-4 sm:w-[320px]">
      {lanes.map((l) => (
        <div key={l.key}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t(l.key)}</span>
            <span dir="ltr" className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{clock(secs(l.wpm))}</span>
          </div>
          <div className="mt-1 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-4 rounded-full ${l.bar}`} style={{ width: `${(secs(l.wpm) / longest) * 100}%`, transition: "width 250ms ease" }} />
          </div>
          <label className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="shrink-0">{t("pace", { wpm: f(l.wpm) })}</span>
            <input type="range" min={l.min} max={l.max} step={5} value={l.wpm} onChange={(e) => l.set(Number(e.target.value))} className={`w-full ${l.accent}`} aria-label={t(l.key)} />
          </label>
        </div>
      ))}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t("ratio", { x: f(secs(speakWpm) / Math.max(secs(readWpm), 1e-9), 2) })}</p>
    </div>
  );

  return (
    <WcIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("words"), value: f(words) },
        { label: t("reading"), value: clock(secs(readWpm)), note: `${f(words)} ÷ ${f(readWpm)} × ${f(60)}` },
        { label: t("speaking"), value: clock(secs(speakWpm)), note: `${f(words)} ÷ ${f(speakWpm)} × ${f(60)}` },
        { label: t("difference"), value: clock(Math.abs(secs(speakWpm) - secs(readWpm))), emphasize: true },
      ]}
    />
  );
}
