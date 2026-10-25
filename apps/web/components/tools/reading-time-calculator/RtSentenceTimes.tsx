"use client";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import RtIndicatorCard from "./RtIndicatorCard";
import { useRtLive } from "./RtLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 176;
const PAD_X = 22;
const TOP = 18;
const BASE = 146;
const MAX_BARS = 60;
/** Sentences that take longer than this many seconds at the chosen pace are marked. */
const SLOW_SECONDS = 8;

/** Labeled Bar Chart (§31 #1): seconds each sentence takes at the chosen pace; click a bar to select that sentence in the text. */
export default function RtSentenceTimes() {
  const t = useTranslations("tools.reading-time-calculator.live.sentences");
  const { sentences, wpm, secondsFor, active, jumpTo, f, clock } = useRtLive();
  const shown = sentences.slice(0, MAX_BARS);
  const secs = sentences.map((s) => secondsFor(s.words));
  const max = Math.max(SLOW_SECONDS * 1.25, ...secs.slice(0, MAX_BARS));
  const slot = (W - PAD_X * 2) / Math.max(shown.length, 1);
  const barW = Math.max(3, Math.min(26, slot * 0.72));
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const avg = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : 0;
  const selected = active?.kind === "sentence" ? sentences[active.index] : undefined;
  let longest = 0;
  for (let i = 1; i < secs.length; i++) if (secs[i] > secs[longest]) longest = i;
  const slowCount = secs.filter((s) => s > SLOW_SECONDS).length;

  const indicator = (
    <div>
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <line x1={PAD_X} y1={y(SLOW_SECONDS)} x2={W - PAD_X} y2={y(SLOW_SECONDS)} strokeDasharray="2 3" className="stroke-rose-400" />
        <text style={{ fontSize: svgPx(12) }} x={W - PAD_X} y={y(SLOW_SECONDS) - 3} textAnchor="end" className="fill-rose-500 dark:fill-rose-400">{t("slowLine", { s: f(SLOW_SECONDS) })}</text>
        {shown.map((s, i) => {
          const x = PAD_X + i * slot + (slot - barW) / 2;
          const on = selected === s;
          const v = secs[i];
          return (
            <g key={s.index} className="cursor-pointer" onClick={() => jumpTo(s.start, s.end, { kind: "sentence", index: s.index })}>
              <rect x={PAD_X + i * slot} y={TOP} width={slot} height={BASE - TOP} fill="transparent" />
              <rect
                x={x}
                y={y(v)}
                width={barW}
                height={BASE - y(v)}
                rx={2}
                className={on ? "fill-amber-400" : v > SLOW_SECONDS ? "fill-rose-500 dark:fill-rose-400" : "fill-blue-600 dark:fill-blue-500"}
                style={{ transition: "y 250ms ease, height 250ms ease" }}
              >
                <title>{t("barTitle", { n: f(s.index + 1), s: f(v) })}</title>
              </rect>
              {shown.length <= 20 && (
                <text style={{ fontSize: svgPx(12) }} x={x + barW / 2} y={y(v) - 3} textAnchor="middle" fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">{f(v, 0)}</text>
              )}
            </g>
          );
        })}
        {avg > 0 && (
          <>
            <line x1={PAD_X} y1={y(avg)} x2={W - PAD_X} y2={y(avg)} strokeWidth={1.5} className="stroke-emerald-600 dark:stroke-emerald-400" style={{ transition: "all 250ms ease" }} />
            <text style={{ fontSize: svgPx(12) }} x={PAD_X} y={y(avg) - 3} fontWeight={600} className="fill-emerald-700 dark:fill-emerald-300">{t("avgLine", { s: f(avg) })}</text>
          </>
        )}
        <line x1={PAD_X} y1={BASE} x2={W - PAD_X} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
        <text style={{ fontSize: svgPx(12) }} x={PAD_X} y={BASE + 14} className="fill-zinc-500 dark:fill-zinc-400">{f(1)}</text>
        <text style={{ fontSize: svgPx(12) }} x={W - PAD_X} y={BASE + 14} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{f(shown.length)}</text>
        <text style={{ fontSize: svgPx(12) }} x={W / 2} y={BASE + 14} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{t("axis")}</text>
      </svg>
      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
        {t("hint")}
        {sentences.length > MAX_BARS && ` · ${t("capped", { n: f(MAX_BARS), total: f(sentences.length) })}`}
      </p>
    </div>
  );

  const focusIdx = selected ? selected.index : longest;
  const focus = sentences[focusIdx];

  return (
    <RtIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={1} title={t("title")}>{indicator}</PhoneMini>}
      rows={[
        { label: t("count"), value: f(sentences.length) },
        { label: t("average"), value: t("seconds", { s: f(avg) }) },
        { label: t("overSlow", { s: f(SLOW_SECONDS) }), value: f(slowCount) },
        ...(focus
          ? [
              { label: selected ? t("selected", { n: f(focus.index + 1) }) : t("longest", { n: f(focus.index + 1) }), value: t("words", { n: f(focus.words) }) },
              { label: t("time"), value: clock(secs[focusIdx]), emphasize: true, note: `${f(focus.words)} ÷ ${f(wpm)} × ${f(60)} = ${f(secs[focusIdx])}` },
            ]
          : []),
      ]}
    />
  );
}
