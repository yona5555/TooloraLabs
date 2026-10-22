"use client";
import { useTranslations } from "next-intl";
import LiIndicatorCard from "./LiIndicatorCard";
import { useLiLive } from "./LiLiveContext";

const W = 330;
const H = 140;
const PAD = 8;
const BOTTOM = 18;
const LONG = 6;

/** Histogram (§31 #2): how many generated words have 1, 2, … 15+ letters; the mean is marked. */
export default function LiWordLengths() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.lengths");
  const { analysis: a, f, pct } = useLiLive();
  const buckets = a.wordLengths;
  const max = Math.max(1, ...buckets);
  const mode = buckets.indexOf(Math.max(...buckets)) + 1;
  const avg = a.words ? a.totalLetters / a.words : 0;
  const long = buckets.slice(LONG).reduce((s, n) => s + n, 0);
  const slot = (W - PAD * 2) / buckets.length;
  const plotH = H - BOTTOM - 14;

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {buckets.map((n, i) => {
          const h = (n / max) * plotH;
          const isLong = i >= LONG;
          return (
            <g key={i}>
              <rect
                x={PAD + i * slot + 2}
                y={H - BOTTOM - h}
                width={slot - 4}
                height={Math.max(n ? 1 : 0, h)}
                rx={3}
                className={i + 1 === mode ? "fill-amber-500 dark:fill-amber-400" : isLong ? "fill-violet-500 dark:fill-violet-400" : "fill-blue-600 dark:fill-blue-500"}
                style={{ transition: "y 300ms ease, height 300ms ease" }}
              >
                <title>{t("barTitle", { n: f(n), len: f(i + 1) })}</title>
              </rect>
              {n > 0 && (
                <text x={PAD + i * slot + slot / 2} y={H - BOTTOM - h - 3} textAnchor="middle" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
                  {f(n)}
                </text>
              )}
              <text x={PAD + i * slot + slot / 2} y={H - 5} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
                {i === buckets.length - 1 ? `${f(i + 1)}+` : f(i + 1)}
              </text>
            </g>
          );
        })}
        <g style={{ transform: `translateX(${PAD + (avg - 0.5) * slot}px)`, transition: "transform 300ms ease" }}>
          <line x1={0} y1={6} x2={0} y2={H - BOTTOM} strokeDasharray="3 2" strokeWidth={1.5} className="stroke-emerald-600 dark:stroke-emerald-400" />
          <text x={3} y={10} fontSize={9} fontWeight={600} className="fill-emerald-700 dark:fill-emerald-300">{t("mean", { n: f(avg, 2) })}</text>
        </g>
      </svg>
      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{t("legend")}</p>
    </div>
  );

  return (
    <LiIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("average"), value: f(avg, 2), note: `${f(a.totalLetters)} ÷ ${f(a.words)}` },
        { label: t("mostCommon"), value: t("letters", { n: f(mode) }), note: t("wordsWith", { n: f(buckets[mode - 1] ?? 0) }) },
        { label: t("longest"), value: a.longestWord || "—" },
        { label: t("longShare"), value: pct(a.words ? long / a.words : 0), emphasize: true, note: `${f(long)} ÷ ${f(a.words)}` },
      ]}
    />
  );
}
