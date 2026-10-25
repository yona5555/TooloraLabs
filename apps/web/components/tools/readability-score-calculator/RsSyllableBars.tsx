"use client";
import { useTranslations } from "next-intl";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { HARD_SYLLABLES, SYLLABLE_BUCKETS } from "./rsScales";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 320;
const H = 180;
const PAD_X = 14;
const TOP = 20;
const BASE = 146;

/** Labeled Bar Chart (§31 #1): words by syllable count; click a bar to highlight those words in the text. */
export default function RsSyllableBars() {
  const t = useTranslations("tools.readability-score-calculator.live.syllables");
  const tr = useTranslations("tools.readability-score-calculator.result");
  const { result, words, f, pct, highlight, setHighlight } = useRsLive();
  const counts = SYLLABLE_BUCKETS.map((b) => words.filter((w) => w.syllables >= b.min && w.syllables <= b.max).length);
  const numbers = words.filter((w) => w.syllables === 0).length;
  const max = Math.max(1, ...counts);
  const slot = (W - PAD_X * 2) / SYLLABLE_BUCKETS.length;
  const barW = slot * 0.62;
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const hard = words.filter((w) => w.syllables >= HARD_SYLLABLES).length;
  const activeIdx = highlight?.kind === "syllables" ? SYLLABLE_BUCKETS.findIndex((b) => b.min === highlight.min && b.max === highlight.max) : -1;

  const indicator = (
    <div className="w-full sm:w-[320px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {SYLLABLE_BUCKETS.map((b, i) => {
          const x = PAD_X + i * slot + (slot - barW) / 2;
          const on = i === activeIdx;
          return (
            <g key={b.label} className="cursor-pointer" onClick={() => setHighlight(on ? null : { kind: "syllables", min: b.min, max: b.max })}>
              <rect x={PAD_X + i * slot} y={TOP - 14} width={slot} height={BASE - TOP + 30} fill="transparent" />
              <rect
                x={x}
                y={y(counts[i])}
                width={barW}
                height={BASE - y(counts[i])}
                rx={3}
                fill={on ? "#fbbf24" : b.color}
                stroke={on ? "#d97706" : "none"}
                strokeWidth={2}
                style={{ transition: "y 300ms ease, height 300ms ease" }}
              />
              <text style={{ fontSize: svgPx(12) }} x={x + barW / 2} y={y(counts[i]) - 4} textAnchor="middle" fontWeight={800} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
                {f(counts[i])}
              </text>
              <text style={{ fontSize: svgPx(12) }} x={x + barW / 2} y={BASE + 14} textAnchor="middle" fontWeight={700} className="fill-zinc-600 dark:fill-zinc-300">
                {b.label}
              </text>
            </g>
          );
        })}
        <line x1={PAD_X} y1={BASE} x2={W - PAD_X} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
        <line x1={PAD_X + 2 * slot} y1={TOP - 12} x2={PAD_X + 2 * slot} y2={BASE + 4} strokeDasharray="3 3" className="stroke-rose-400" />
        <text style={{ fontSize: svgPx(12) }} x={PAD_X + 2 * slot + 4} y={TOP - 4} fontWeight={700} className="fill-rose-500 dark:fill-rose-400">{t("hardZone")}</text>
        <text style={{ fontSize: svgPx(12) }} x={W / 2} y={BASE + 28} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{t("axis")}</text>
      </svg>
      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">{t("hint")}</p>
    </div>
  );

  return (
    <RsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: tr("syllableCount"), value: f(result.syllableCount), note: numbers ? t("numbersNote", { n: f(numbers) }) : undefined },
        { label: tr("wordCount"), value: f(result.wordCount) },
        { label: tr("averageSyllablesPerWord"), value: f(result.averageSyllablesPerWord, 3), note: `${f(result.syllableCount)} ÷ ${f(result.wordCount)}` },
        activeIdx >= 0
          ? { label: t("highlighted", { n: SYLLABLE_BUCKETS[activeIdx].label }), value: f(counts[activeIdx]), emphasize: true, note: pct(result.wordCount ? counts[activeIdx] / result.wordCount : 0) }
          : { label: t("hardShare"), value: pct(result.wordCount ? hard / result.wordCount : 0), emphasize: true, note: `${f(hard)} ÷ ${f(result.wordCount)}` },
      ]}
    />
  );
}
