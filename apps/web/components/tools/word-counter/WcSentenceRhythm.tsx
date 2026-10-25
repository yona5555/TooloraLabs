"use client";
import { useTranslations } from "next-intl";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 180;
const PAD_X = 22;
const TOP = 18;
const BASE = 150;
const MAX_BARS = 60;
/** Common plain-language guidance: sentences above ~25 words get hard to follow. */
const LONG = 25;
const SHORT = 8;

function barClass(words: number, active: boolean) {
  if (active) return "fill-amber-400";
  if (words > LONG) return "fill-rose-500 dark:fill-rose-400";
  if (words < SHORT) return "fill-sky-400 dark:fill-sky-500";
  return "fill-blue-600 dark:fill-blue-500";
}

/** Labeled Bar Chart (§31 #1): one bar per sentence in reading order; click a bar to select that sentence in the text. */
export default function WcSentenceRhythm() {
  const t = useTranslations("tools.word-counter.live.rhythm");
  const { profile, f, jumpTo, activeSentence } = useWcLive();
  const all = profile.sentences;
  const shown = all.slice(0, MAX_BARS);
  const max = Math.max(LONG + 5, ...shown.map((s) => s.words));
  const slot = (W - PAD_X * 2) / Math.max(shown.length, 1);
  const barW = Math.max(3, Math.min(26, slot * 0.72));
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const avg = profile.averageSentenceLength;
  const longest = all.reduce((best, s) => (s.words > (best?.words ?? -1) ? s : best), all[0]);
  const shortest = all.reduce((best, s) => (s.words < (best?.words ?? Infinity) ? s : best), all[0]);
  const active = activeSentence != null ? all[activeSentence] : undefined;
  const longCount = all.filter((s) => s.words > LONG).length;

  const indicator = (
    <div>
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <line x1={PAD_X} y1={y(LONG)} x2={W - PAD_X} y2={y(LONG)} strokeDasharray="2 3" className="stroke-rose-400" />
        <text style={{ fontSize: svgPx(12) }} x={W - PAD_X} y={y(LONG) - 3} textAnchor="end" className="fill-rose-500 dark:fill-rose-400">{`${f(LONG)} · ${t("longLine")}`}</text>
        {shown.map((s, i) => {
          const x = PAD_X + i * slot + (slot - barW) / 2;
          const isActive = s.index === activeSentence;
          return (
            <g key={s.index} className="cursor-pointer" onClick={() => jumpTo(s.start, s.end, s.index)}>
              <rect x={PAD_X + i * slot} y={TOP} width={slot} height={BASE - TOP} fill="transparent" />
              <rect x={x} y={y(s.words)} width={barW} height={BASE - y(s.words)} rx={2} className={barClass(s.words, isActive)} style={{ transition: "y 250ms ease, height 250ms ease" }}>
                <title>{t("barTitle", { n: f(s.index + 1), words: f(s.words) })}</title>
              </rect>
              {shown.length <= 24 && (
                <text style={{ fontSize: svgPx(12) }} x={x + barW / 2} y={y(s.words) - 3} textAnchor="middle" fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">{f(s.words)}</text>
              )}
            </g>
          );
        })}
        {avg > 0 && (
          <>
            <line x1={PAD_X} y1={y(avg)} x2={W - PAD_X} y2={y(avg)} strokeWidth={1.5} className="stroke-emerald-600 dark:stroke-emerald-400" />
            <text style={{ fontSize: svgPx(12) }} x={PAD_X} y={y(avg) - 3} fontWeight={600} className="fill-emerald-700 dark:fill-emerald-300">{`${t("avgLine")} ${f(avg)}`}</text>
          </>
        )}
        <line x1={PAD_X} y1={BASE} x2={W - PAD_X} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
        <text style={{ fontSize: svgPx(12) }} x={PAD_X} y={BASE + 14} className="fill-zinc-500 dark:fill-zinc-400">{`${t("first")} ${f(1)}`}</text>
        <text style={{ fontSize: svgPx(12) }} x={W - PAD_X} y={BASE + 14} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{f(shown.length)}</text>
      </svg>
      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
        {t("hint")}
        {all.length > MAX_BARS && ` · ${t("capped", { n: f(MAX_BARS), total: f(all.length) })}`}
      </p>
    </div>
  );

  return (
    <WcIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("count"), value: f(all.length) },
        { label: t("average"), value: f(avg), note: t("avgNote") },
        { label: t("longest"), value: longest ? f(longest.words) : "—", note: longest ? t("which", { n: f(longest.index + 1) }) : undefined },
        { label: t("shortest"), value: shortest ? f(shortest.words) : "—", note: shortest ? t("which", { n: f(shortest.index + 1) }) : undefined },
        { label: t("overLong", { n: f(LONG) }), value: f(longCount) },
        active
          ? { label: t("selected", { n: f(active.index + 1) }), value: f(active.words), emphasize: true }
          : { label: t("variation"), value: f(longest && shortest ? longest.words - shortest.words : 0), emphasize: true, note: t("variationNote") },
      ]}
    />
  );
}
