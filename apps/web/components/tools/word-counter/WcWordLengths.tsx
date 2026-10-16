"use client";
import { useTranslations } from "next-intl";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";

const W = 330;
const H = 176;
const PAD = 12;
const TOP = 30;
const BASE = 140;

/** Annotated Reference Point (§31 #20): the word-length distribution with the average word length pinned on it. */
export default function WcWordLengths() {
  const t = useTranslations("tools.word-counter.live.wordLengths");
  const { profile, stats, f, pct } = useWcLive();
  const buckets = profile.wordLengths;
  const tokens = buckets.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...buckets);
  const slot = (W - PAD * 2) / buckets.length;
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const modeIdx = buckets.indexOf(Math.max(...buckets));
  const avg = stats.averageWordLength;
  // Bucket i holds length i + 1, centred in its slot.
  const avgX = PAD + Math.min(Math.max(avg - 0.5, 0), buckets.length) * slot;
  const longShare = tokens ? profile.longWords / tokens : 0;

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      {buckets.map((c, i) => (
        <g key={i}>
          <rect x={PAD + i * slot + 2} y={y(c)} width={slot - 4} height={BASE - y(c)} rx={2} className={i + 1 > 6 ? "fill-violet-500 dark:fill-violet-400" : "fill-sky-500 dark:fill-sky-400"} style={{ transition: "y 250ms ease, height 250ms ease" }} />
          {c > 0 && <text x={PAD + i * slot + slot / 2} y={y(c) - 3} textAnchor="middle" fontSize={8.5} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">{f(c)}</text>}
          <text x={PAD + i * slot + slot / 2} y={BASE + 12} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
            {i === buckets.length - 1 ? `${f(i + 1)}+` : f(i + 1)}
          </text>
        </g>
      ))}
      <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <g style={{ transform: `translateX(${avgX}px)`, transition: "transform 300ms ease" }}>
        <line x1={0} y1={18} x2={0} y2={BASE} strokeWidth={2} strokeDasharray="4 3" className="stroke-amber-500" />
        <rect x={-30} y={4} width={60} height={16} rx={8} className="fill-amber-500" />
        <text x={0} y={15.5} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-white">{`x̄ ${f(avg)}`}</text>
      </g>
      <text x={W / 2} y={BASE + 28} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">{t("axis")}</text>
    </svg>
  );

  return (
    <WcIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("tokens"), value: f(tokens) },
        { label: t("mode"), value: f(modeIdx + 1), note: t("modeNote", { n: f(buckets[modeIdx] ?? 0) }) },
        { label: t("long"), value: pct(longShare), note: t("longNote") },
        { label: t("average"), value: f(avg), emphasize: true, note: t("averageNote") },
      ]}
    />
  );
}
