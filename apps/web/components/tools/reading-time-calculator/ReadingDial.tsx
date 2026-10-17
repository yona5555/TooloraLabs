"use client";
import { useTranslations } from "next-intl";
import { dialMinutes, SEGMENT_DOTS, SEGMENT_STROKES } from "./rtMath";
import { useRtLive } from "./RtLiveContext";

const SIZE = 184;
const C = SIZE / 2;
const R = 70;
const LEGEND_ROWS = 5;

/** Multi-Ring Donut / clock face (§31 #6): the reading time as a stopwatch arc split by paragraph, on a dial that rescales to the text. */
export default function ReadingDial() {
  const t = useTranslations("tools.reading-time-calculator.live.dial");
  const { result, paragraphs, secondsFor, f, clock } = useRtLive();
  const span = dialMinutes(result.totalSeconds);
  const spanSec = span * 60;
  const circ = 2 * Math.PI * R;
  // 1-min dial: 5-second ticks; 2–3 min: quarter-minute ticks; up to 15 min: one per minute; longer: 12 ticks.
  const ticks = span === 1 ? 12 : span <= 3 ? span * 4 : span <= 15 ? span : 12;
  const majorEvery = span === 1 ? 3 : span <= 3 ? 4 : ticks >= 10 ? 3 : 1;
  const exact = paragraphs.map((p) => secondsFor(p.words));
  const starts = exact.map((_, i) => exact.slice(0, i).reduce((a, s) => a + s, 0));
  const sweep = Math.min(1, result.totalSeconds / spanSec);
  const angle = sweep * 360;
  const longest = paragraphs.reduce((b, p) => (p.words > (b?.words ?? -1) ? p : b), paragraphs[0]);

  return (
    <div data-preview="visual" className="flex shrink-0 flex-col items-center gap-3 sm:w-[192px]">
      <svg direction="ltr" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")}>
        <circle cx={C} cy={C} r={R + 14} className="fill-zinc-50 stroke-zinc-200 dark:fill-zinc-800/60 dark:stroke-zinc-700" />
        {Array.from({ length: ticks }, (_, i) => {
          const a = (i / ticks) * 2 * Math.PI - Math.PI / 2;
          const major = i % majorEvery === 0;
          return (
            <line
              key={i}
              x1={C + Math.cos(a) * (R + 8)}
              y1={C + Math.sin(a) * (R + 8)}
              x2={C + Math.cos(a) * (R + (major ? 13 : 11))}
              y2={C + Math.sin(a) * (R + (major ? 13 : 11))}
              strokeWidth={major ? 2 : 1}
              className="stroke-zinc-400 dark:stroke-zinc-500"
            />
          );
        })}
        <g transform={`rotate(-90 ${C} ${C})`}>
          <circle cx={C} cy={C} r={R} fill="none" strokeWidth={14} className="stroke-zinc-200 dark:stroke-zinc-700/70" />
          {exact.map((s, i) => {
            const len = Math.max(0, Math.min(s, spanSec - starts[i]) / spanSec) * circ;
            return (
              <circle
                key={i}
                cx={C}
                cy={C}
                r={R}
                fill="none"
                strokeWidth={14}
                className={SEGMENT_STROKES[i % SEGMENT_STROKES.length]}
                strokeDasharray={`${Math.max(0, len - (exact.length > 1 ? 1.5 : 0))} ${circ}`}
                strokeDashoffset={-(starts[i] / spanSec) * circ}
                style={{ transition: "stroke-dasharray 350ms ease, stroke-dashoffset 350ms ease" }}
              />
            );
          })}
        </g>
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${C}px ${C}px`, transition: "transform 450ms cubic-bezier(.3,1.4,.5,1)" }}>
          <line x1={C} y1={C} x2={C} y2={C - R + 4} strokeWidth={2.5} strokeLinecap="round" className="stroke-amber-500 dark:stroke-amber-400" />
          <circle cx={C} cy={C - R} r={4.5} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" strokeWidth={1.5} />
        </g>
        <circle cx={C} cy={C} r={30} className="fill-white dark:fill-zinc-900" />
        <circle cx={C} cy={C} r={3} className="fill-amber-500 dark:fill-amber-400" />
        <text x={C} y={C - 8} textAnchor="middle" fontSize={20} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-900 dark:fill-zinc-100">
          {clock(result.totalSeconds)}
        </text>
        <text x={C} y={C + 18} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
          {t("scale", { n: f(span) })}
        </text>
      </svg>
      <ul className="w-full space-y-1 text-[11px]">
        {paragraphs.slice(0, LEGEND_ROWS).map((p, i) => (
          <li key={p.index} className="flex items-center justify-between gap-2">
            <span className={`flex items-center gap-1.5 ${p === longest ? "font-semibold text-zinc-800 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${SEGMENT_DOTS[i % SEGMENT_DOTS.length]}`} />
              {t("paragraph", { n: f(i + 1) })}
            </span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              {clock(exact[i])}
            </span>
          </li>
        ))}
        {paragraphs.length > LEGEND_ROWS && (
          <li className="flex justify-between text-zinc-500 dark:text-zinc-400">
            <span>{t("more", { n: f(paragraphs.length - LEGEND_ROWS) })}</span>
            <span dir="ltr" className="font-mono">{clock(exact.slice(LEGEND_ROWS).reduce((a, s) => a + s, 0))}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
