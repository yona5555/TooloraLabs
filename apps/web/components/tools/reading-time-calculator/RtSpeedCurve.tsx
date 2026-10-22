"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { READING_SPEED_PRESETS } from "@tooloralabs/tools";
import RtIndicatorCard from "./RtIndicatorCard";
import { useRtLive } from "./RtLiveContext";

const W = 340;
const H = 190;
const L = 40;
const R = 12;
const TOP = 14;
const BASE = 160;
const MIN = 100;
const MAX = 600;
const PRESET_KEYS = ["slow", "average", "fast"] as const;

/** Trend Line with Highlighted Reference Point (§31 #7): time falls as a hyperbola of speed; drag "try a speed" to compare with yours. */
export default function RtSpeedCurve() {
  const t = useTranslations("tools.reading-time-calculator.live.curve");
  const tf = useTranslations("tools.reading-time-calculator.form.presets");
  const { result, wpm, secondsFor, f, clock } = useRtLive();
  const [trial, setTrial] = useState(400);
  const words = result.wordCount;
  const yMax = secondsFor(words, MIN) || 1;
  const x = (v: number) => L + ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * (W - L - R);
  const y = (sec: number) => BASE - (sec / yMax) * (BASE - TOP);
  const path = Array.from({ length: 51 }, (_, i) => {
    const v = MIN + ((MAX - MIN) * i) / 50;
    return `${i ? "L" : "M"}${x(v).toFixed(1)},${y(secondsFor(words, v)).toFixed(1)}`;
  }).join(" ");
  const yours = secondsFor(words, wpm);
  const tried = secondsFor(words, trial);
  const delta = tried - yours;

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {[0, 0.5, 1].map((k) => (
          <g key={k}>
            <line x1={L} y1={y(yMax * k)} x2={W - R} y2={y(yMax * k)} strokeDasharray="2 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
            <text x={L - 4} y={y(yMax * k) + 3} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">{clock(yMax * k)}</text>
          </g>
        ))}
        <path d={`${path} L${x(MAX)},${BASE} L${x(MIN)},${BASE} Z`} className="fill-blue-500/10 dark:fill-blue-400/10" />
        <path d={path} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
        <line x1={L} y1={BASE} x2={W - R} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {[100, 200, 300, 400, 500, 600].map((v) => (
          <text key={v} x={x(v)} y={BASE + 13} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">{f(v)}</text>
        ))}
        <text x={W - R} y={BASE + 25} textAnchor="end" fontSize={9} fontWeight={600} className="fill-zinc-500 dark:fill-zinc-400">{t("axis")}</text>
        {PRESET_KEYS.map((k) => {
          const v = READING_SPEED_PRESETS[k];
          return (
            <g key={k}>
              <circle cx={x(v)} cy={y(secondsFor(words, v))} r={3.5} className="fill-white stroke-blue-600 dark:fill-zinc-900 dark:stroke-blue-400" strokeWidth={1.5} />
              <text x={x(v) + 5} y={y(secondsFor(words, v)) - 5} fontSize={9} className="fill-zinc-600 dark:fill-zinc-300">{tf(k)}</text>
            </g>
          );
        })}
        <g style={{ transform: `translate(${x(trial)}px, ${y(tried)}px)`, transition: "transform 200ms ease" }}>
          <line x1={0} y1={0} x2={0} y2={BASE - y(tried)} strokeDasharray="3 2" className="stroke-amber-500" />
          <circle r={6} className="fill-amber-500 stroke-white dark:stroke-zinc-900" strokeWidth={2} />
          <text x={trial > 480 ? -8 : 8} y={-8} textAnchor={trial > 480 ? "end" : "start"} fontSize={10} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">{clock(tried)}</text>
        </g>
        <g style={{ transform: `translate(${x(wpm)}px, ${y(yours)}px)`, transition: "transform 300ms ease" }}>
          <circle r={7} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" strokeWidth={2} />
          <text x={8} y={14} fontSize={10} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">{`${t("yours")} ${clock(yours)}`}</text>
        </g>
      </svg>
      <label className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="shrink-0">{t("try", { wpm: f(trial) })}</span>
        <input type="range" min={MIN} max={MAX} step={10} value={trial} onChange={(e) => setTrial(Number(e.target.value))} className="w-full accent-amber-500" aria-label={t("tryLabel")} />
      </label>
    </div>
  );

  return (
    <RtIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("yourSpeed", { wpm: f(wpm) }), value: clock(yours), note: `${f(words)} ÷ ${f(wpm)} × ${f(60)}` },
        { label: t("trySpeed", { wpm: f(trial) }), value: clock(tried), note: `${f(words)} ÷ ${f(trial)} × ${f(60)}` },
        { label: t("ratio"), value: `×${f(wpm / trial, 2)}`, note: `${f(wpm)} ÷ ${f(trial)}` },
        { label: delta <= 0 ? t("saves") : t("adds"), value: clock(Math.abs(delta)), emphasize: true },
      ]}
    />
  );
}
