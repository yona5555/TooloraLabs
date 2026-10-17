"use client";
import { useTranslations } from "next-intl";
import { dialMinutes, PACE_TONES } from "./swMath";
import { SPEECH_PACE_PRESETS, type SpeechPacePreset } from "./types";
import { useSwLive } from "./SwLiveContext";

const SIZE = 184;
const C = SIZE / 2;
const RINGS = [76, 62, 48];
const WIDTH = 10;
const KEYS = ["formal", "normal", "fast"] as const;

/** Concentric stopwatch rings (§31 #6): the same speech timed at each pace preset on one shared dial; the active pace glows and the hand marks it. */
export default function PaceRings() {
  const t = useTranslations("tools.speech-word-count-calculator.live.rings");
  const tf = useTranslations("tools.speech-word-count-calculator.form.presets");
  const { result, wpm, preset, setPreset, secondsFor, f, clock } = useSwLive();
  const words = result.wordCount;
  const custom = preset === "custom";
  const rings: { key: SpeechPacePreset; rate: number; r: number }[] = KEYS.map((k, i) => ({ key: k, rate: SPEECH_PACE_PRESETS[k], r: RINGS[i] }));
  // A custom pace replaces nothing: it is drawn as the hand only, against the three preset rings.
  const longestSec = Math.max(secondsFor(words, SPEECH_PACE_PRESETS.formal), result.totalSeconds);
  const span = dialMinutes(longestSec);
  const spanSec = span * 60;
  const angle = Math.min(1, result.totalSeconds / spanSec) * 360;
  const ticks = span === 1 ? 12 : span <= 3 ? span * 4 : span <= 15 ? span : 12;

  return (
    <div data-preview="visual" className="flex shrink-0 flex-col items-center gap-3 sm:w-[192px]">
      <svg direction="ltr" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")}>
        <circle cx={C} cy={C} r={RINGS[0] + 12} className="fill-zinc-50 stroke-zinc-200 dark:fill-zinc-800/60 dark:stroke-zinc-700" />
        {Array.from({ length: ticks }, (_, i) => {
          const a = (i / ticks) * 2 * Math.PI - Math.PI / 2;
          const r0 = RINGS[0] + 7;
          return (
            <line
              key={i}
              x1={C + Math.cos(a) * r0}
              y1={C + Math.sin(a) * r0}
              x2={C + Math.cos(a) * (r0 + 4)}
              y2={C + Math.sin(a) * (r0 + 4)}
              strokeWidth={i === 0 ? 2 : 1}
              className="stroke-zinc-400 dark:stroke-zinc-500"
            />
          );
        })}
        <g transform={`rotate(-90 ${C} ${C})`}>
          {rings.map((ring) => {
            const circ = 2 * Math.PI * ring.r;
            const len = Math.min(1, secondsFor(words, ring.rate) / spanSec) * circ;
            const on = preset === ring.key;
            return (
              <g key={ring.key} className="cursor-pointer" onClick={() => setPreset(ring.key)}>
                <circle cx={C} cy={C} r={ring.r} fill="none" strokeWidth={WIDTH} className="stroke-zinc-200 dark:stroke-zinc-700/70" />
                <circle
                  cx={C}
                  cy={C}
                  r={ring.r}
                  fill="none"
                  strokeWidth={on ? WIDTH + 2 : WIDTH}
                  strokeLinecap="round"
                  className={`${PACE_TONES[ring.key as keyof typeof PACE_TONES].stroke} ${on || custom ? "opacity-100" : "opacity-45"}`}
                  strokeDasharray={`${len} ${circ}`}
                  style={{ transition: "stroke-dasharray 450ms ease, opacity 250ms ease, stroke-width 250ms ease" }}
                >
                  <title>{`${tf(ring.key)} · ${clock(secondsFor(words, ring.rate))}`}</title>
                </circle>
              </g>
            );
          })}
        </g>
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${C}px ${C}px`, transition: "transform 450ms cubic-bezier(.3,1.4,.5,1)" }}>
          <line x1={C} y1={C - 30} x2={C} y2={C - RINGS[0] - 6} strokeWidth={2.5} strokeLinecap="round" className="stroke-amber-500 dark:stroke-amber-400" />
          <circle cx={C} cy={C - RINGS[0] - 6} r={4} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" strokeWidth={1.5} />
        </g>
        <circle cx={C} cy={C} r={34} className="fill-white dark:fill-zinc-900" />
        <text x={C} y={C - 4} textAnchor="middle" fontSize={19} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-900 dark:fill-zinc-100">
          {clock(result.totalSeconds)}
        </text>
        <text x={C} y={C + 14} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
          {t("wpm", { wpm: f(wpm) })}
        </text>
        <text x={C} y={C + 25} textAnchor="middle" fontSize={8} className="fill-zinc-400 dark:fill-zinc-500">
          {t("scale", { n: f(span) })}
        </text>
      </svg>
      <ul className="w-full space-y-1 text-[11px]">
        {[...rings, ...(custom ? [{ key: "custom" as const, rate: wpm, r: 0 }] : [])].map((ring) => (
          <li key={ring.key}>
            <button
              type="button"
              onClick={() => setPreset(ring.key)}
              aria-pressed={preset === ring.key}
              className={`flex w-full items-center justify-between gap-2 rounded px-1 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 ${preset === ring.key ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"}`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${PACE_TONES[ring.key].bg}`} />
                {tf(ring.key)} <span dir="ltr" className="text-zinc-400">({f(ring.rate)})</span>
              </span>
              <span dir="ltr" className="font-mono font-semibold">{clock(secondsFor(words, ring.rate))}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
