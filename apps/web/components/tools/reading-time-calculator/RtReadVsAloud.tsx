"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { SPEAKING_WPM } from "@tooloralabs/tools";
import RtIndicatorCard from "./RtIndicatorCard";
import { useRtLive } from "./RtLiveContext";

/** Side-by-Side Equivalence (§31 #11): silent reading at your pace vs reading the same words aloud, with a draggable speaking pace. */
export default function RtReadVsAloud() {
  const t = useTranslations("tools.reading-time-calculator.live.aloud");
  const { result, wpm, secondsFor, f, clock } = useRtLive();
  const [speak, setSpeak] = useState(SPEAKING_WPM);
  const words = result.wordCount;
  const silent = secondsFor(words, wpm);
  const aloud = secondsFor(words, speak);
  const longest = Math.max(silent, aloud, 1);

  const lanes = [
    { key: "silent", sec: silent, rate: wpm, bar: "bg-blue-600 dark:bg-blue-500" },
    { key: "aloud", sec: aloud, rate: speak, bar: "bg-violet-600 dark:bg-violet-500" },
  ] as const;

  const indicator = (
    <div className="w-full space-y-4 sm:w-[320px]">
      {lanes.map((l) => (
        <div key={l.key}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t(l.key)}</span>
            <span dir="ltr" className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{clock(l.sec)}</span>
          </div>
          <div className="mt-1 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-4 rounded-full ${l.bar}`} style={{ width: `${(l.sec / longest) * 100}%`, transition: "width 250ms ease" }} />
          </div>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{t("pace", { wpm: f(l.rate) })}</p>
        </div>
      ))}
      <label className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="shrink-0">{t("speakPace")}</span>
        <input type="range" min={90} max={200} step={5} value={speak} onChange={(e) => setSpeak(Number(e.target.value))} className="w-full accent-violet-600" aria-label={t("speakPace")} />
      </label>
    </div>
  );

  return (
    <RtIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("silent"), value: clock(silent), note: `${f(words)} ÷ ${f(wpm)} × ${f(60)}` },
        { label: t("aloud"), value: clock(aloud), note: `${f(words)} ÷ ${f(speak)} × ${f(60)}` },
        { label: t("ratio"), value: `×${f(aloud / Math.max(silent, 1e-9), 2)}`, note: `${f(wpm)} ÷ ${f(speak)}` },
        { label: t("difference"), value: clock(Math.abs(aloud - silent)), emphasize: true },
      ]}
    />
  );
}
