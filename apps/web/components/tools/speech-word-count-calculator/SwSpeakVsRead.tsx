"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { READING_WPM } from "@tooloralabs/tools";
import SwIndicatorCard from "./SwIndicatorCard";
import { useSwLive } from "./SwLiveContext";

/** Side-by-Side Equivalence (§31 #11): delivering the speech aloud at your pace vs reading the same words silently, with a draggable reading pace. */
export default function SwSpeakVsRead() {
  const t = useTranslations("tools.speech-word-count-calculator.live.speakRead");
  const tb = useTranslations("tools.speech-word-count-calculator.education.behindTheTool.speakingVsReading");
  const { result, wpm, secondsFor, f, clock } = useSwLive();
  const [read, setRead] = useState(READING_WPM);
  const words = result.wordCount;
  const aloud = secondsFor(words, wpm);
  const silent = secondsFor(words, read);
  const longest = Math.max(silent, aloud, 1);

  const lanes = [
    { key: "aloud", sec: aloud, rate: wpm, bar: "bg-blue-600 dark:bg-blue-500" },
    { key: "silent", sec: silent, rate: read, bar: "bg-teal-500 dark:bg-teal-400" },
  ] as const;

  const indicator = (
    <div className="w-full space-y-4 sm:w-[320px]">
      {lanes.map((l) => (
        <div key={l.key}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t(l.key)}</span>
            <span dir="ltr" className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{clock(l.sec)}</span>
          </div>
          <div dir="ltr" className="mt-1 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-4 rounded-full ${l.bar}`} style={{ width: `${(l.sec / longest) * 100}%`, transition: "width 250ms ease" }} />
          </div>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{t("pace", { wpm: f(l.rate) })}</p>
        </div>
      ))}
      <label className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="shrink-0">{t("readPace")}</span>
        <input type="range" min={150} max={350} step={10} value={read} onChange={(e) => setRead(Number(e.target.value))} className="w-full accent-teal-600" aria-label={t("readPace")} />
      </label>
    </div>
  );

  return (
    <SwIndicatorCard
      title={tb("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("aloud"), value: clock(aloud), note: `${f(words)} ÷ ${f(wpm)} × ${f(60)}` },
        { label: t("silent"), value: clock(silent), note: `${f(words)} ÷ ${f(read)} × ${f(60)}` },
        { label: t("ratio"), value: `×${f(aloud / Math.max(silent, 1e-9), 2)}`, note: `${f(read)} ÷ ${f(wpm)}` },
        { label: t("difference"), value: clock(Math.abs(aloud - silent)), emphasize: true },
      ]}
    />
  );
}
