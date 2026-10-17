"use client";
import { useTranslations } from "next-intl";
import { useWcLive } from "./WcLiveContext";

const SIZE = 176;
const C = SIZE / 2;
const OUTER_R = 74;
const INNER_R = 52;

export const COMPOSITION = [
  { key: "letters", stroke: "stroke-blue-600 dark:stroke-blue-400", dot: "bg-blue-600 dark:bg-blue-400" },
  { key: "digits", stroke: "stroke-violet-600 dark:stroke-violet-400", dot: "bg-violet-600 dark:bg-violet-400" },
  { key: "spaces", stroke: "stroke-zinc-400 dark:stroke-zinc-500", dot: "bg-zinc-400 dark:bg-zinc-500" },
  { key: "punctuation", stroke: "stroke-amber-500 dark:stroke-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
  { key: "other", stroke: "stroke-rose-500 dark:stroke-rose-400", dot: "bg-rose-500 dark:bg-rose-400" },
] as const;

type Seg = { value: number; stroke: string };

/** One ring of arcs; dash lengths animate with CSS so every keystroke morphs the ring smoothly. */
function Ring({ r, width, segs }: { r: number; width: number; segs: Seg[] }) {
  const circ = 2 * Math.PI * r;
  const total = segs.reduce((a, s) => a + s.value, 0) || 1;
  // Each arc starts where the previous ones end.
  const starts = segs.map((_, i) => segs.slice(0, i).reduce((a, s) => a + (s.value / total) * circ, 0));
  return (
    <g transform={`rotate(-90 ${C} ${C})`}>
      <circle cx={C} cy={C} r={r} fill="none" strokeWidth={width} className="stroke-zinc-100 dark:stroke-zinc-800" />
      {segs.map((s, i) => {
        const len = (s.value / total) * circ;
        const offset = -starts[i];
        return (
          <circle
            key={i}
            cx={C}
            cy={C}
            r={r}
            fill="none"
            strokeWidth={width}
            className={s.stroke}
            strokeDasharray={`${len} ${circ}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dasharray 300ms ease, stroke-dashoffset 300ms ease" }}
          />
        );
      })}
    </g>
  );
}

/** Multi-Ring Donut (§31 #6): outer ring = character classes, inner ring = unique vs repeated words. */
export default function CompositionRing() {
  const t = useTranslations("tools.word-counter.live.ring");
  const { profile, stats, f, pct } = useWcLive();
  const comp = profile.composition;
  const totalChars = Object.values(comp).reduce((a, b) => a + b, 0);
  const tokens = profile.wordLengths.reduce((a, b) => a + b, 0);
  const repeated = Math.max(0, tokens - stats.uniqueWords);

  return (
    <div data-preview="visual" className="flex shrink-0 flex-col items-center gap-3 sm:w-[184px]">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")}>
        <Ring r={OUTER_R} width={18} segs={COMPOSITION.map((c) => ({ value: comp[c.key], stroke: c.stroke }))} />
        <Ring
          r={INNER_R}
          width={10}
          segs={[
            { value: stats.uniqueWords, stroke: "stroke-emerald-500 dark:stroke-emerald-400" },
            { value: repeated, stroke: "stroke-emerald-200 dark:stroke-emerald-800" },
          ]}
        />
        <text x={C} y={C - 4} textAnchor="middle" fontSize={22} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-900 dark:fill-zinc-100">
          {f(totalChars)}
        </text>
        <text x={C} y={C + 14} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
          {t("center")}
        </text>
      </svg>
      <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-1">
        {COMPOSITION.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
              {t(c.key)}
            </span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              {f(comp[c.key])} · {pct(totalChars ? comp[c.key] / totalChars : 0)}
            </span>
          </li>
        ))}
        <li className="col-span-2 mt-1 flex items-center justify-between gap-2 border-t border-zinc-200 pt-1 dark:border-zinc-700 sm:col-span-1">
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            {t("unique")}
          </span>
          <span dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
            {f(stats.uniqueWords)} / {f(tokens)}
          </span>
        </li>
      </ul>
    </div>
  );
}
