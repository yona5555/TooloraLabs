"use client";
import { useTranslations } from "next-intl";
import { EASE_BANDS, EASE_MAX, EASE_MIN, SYLLABLE_BUCKETS, clampEase, easeBand } from "./rsScales";
import { useRsLive } from "./RsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const SIZE = 176;
const C = SIZE / 2;
const OUTER_R = 76;
const INNER_R = 54;
const START = 135;
const SWEEP = 270;

const angleOf = (score: number) => START + ((clampEase(score) - EASE_MIN) / (EASE_MAX - EASE_MIN)) * SWEEP;
const polar = (deg: number, r: number) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)] as const;

function arc(from: number, to: number, r: number) {
  const [x0, y0] = polar(angleOf(from), r);
  const [x1, y1] = polar(angleOf(to), r);
  const large = angleOf(to) - angleOf(from) > 180 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

/** Inner ring: share of words by syllable count; dash lengths animate so every keystroke morphs it. */
function MixRing({ counts }: { counts: number[] }) {
  const circ = 2 * Math.PI * INNER_R;
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const starts = counts.map((_, i) => counts.slice(0, i).reduce((a, n) => a + (n / total) * circ, 0));
  return (
    <g transform={`rotate(-90 ${C} ${C})`}>
      <circle cx={C} cy={C} r={INNER_R} fill="none" strokeWidth={9} className="stroke-zinc-100 dark:stroke-zinc-800" />
      {counts.map((n, i) => {
        const len = (n / total) * circ;
        const offset = -starts[i];
        return (
          <circle
            key={i}
            cx={C}
            cy={C}
            r={INNER_R}
            fill="none"
            strokeWidth={9}
            stroke={SYLLABLE_BUCKETS[i].color}
            strokeDasharray={`${len} ${circ}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dasharray 300ms ease, stroke-dashoffset 300ms ease" }}
          />
        );
      })}
    </g>
  );
}

/** Gradient Gauge (§31 #8) + Multi-Ring Donut: Reading Ease on a 270° banded dial, word syllable mix inside. */
export default function ScoreDial() {
  const t = useTranslations("tools.readability-score-calculator.live.dial");
  const tBands = useTranslations("tools.readability-score-calculator.result.bands");
  const { result, words, f, pct } = useRsLive();
  const score = result.fleschReadingEase;
  const band = easeBand(score);
  const counts = SYLLABLE_BUCKETS.map((b) => words.filter((w) => w.syllables >= b.min && w.syllables <= b.max).length);
  const counted = counts.reduce((a, b) => a + b, 0);

  return (
    <div data-preview="visual" className="flex w-full flex-wrap items-center justify-center gap-5 lg:flex-nowrap lg:justify-start">
      <svg direction="ltr" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")} className="shrink-0">
        {EASE_BANDS.map((b) => (
          <path key={b.key} d={arc(b.from, b.to, OUTER_R)} fill="none" stroke={b.color} strokeWidth={12} opacity={b === band ? 1 : 0.35} style={{ transition: "opacity 300ms" }} />
        ))}
        <g style={{ transform: `rotate(${angleOf(score)}deg)`, transformOrigin: `${C}px ${C}px`, transition: "transform 450ms cubic-bezier(.3,1.4,.5,1)" }}>
          <circle cx={C + OUTER_R} cy={C} r={8} stroke={band.color} strokeWidth={3} className="fill-white dark:fill-zinc-900" />
        </g>
        <MixRing counts={counts} />
        <text style={{ fontSize: svgPx(26) }} x={C} y={C + 2} textAnchor="middle" fontWeight={800} fontFamily="var(--font-mono)" className="fill-zinc-900 dark:fill-zinc-50">
          {f(score)}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={C} y={C + 18} textAnchor="middle" fontWeight={700} fill={band.color}>
          {tBands(band.key)}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={C} y={SIZE - 8} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {`${f(EASE_MIN)} … ${f(EASE_MAX)}`}
        </text>
      </svg>
      <ul className="flex min-w-[10rem] flex-1 flex-col justify-between gap-1 self-stretch py-2 text-xs lg:min-w-0">
        {SYLLABLE_BUCKETS.map((b, i) => (
          <li key={b.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
              {t("bucket", { n: b.label })}
            </span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              {f(counts[i])} · {pct(counted ? counts[i] / counted : 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
