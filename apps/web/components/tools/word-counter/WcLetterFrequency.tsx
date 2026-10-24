"use client";
import { useTranslations } from "next-intl";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";

const W = 330;
const H = 170;
const TOP = 16;
const BASE = 138;
const PAD = 8;

/** Labeled Bar Chart (§31 #1): the twelve most frequent letters with their counts, most frequent first. */
export default function WcLetterFrequency() {
  const t = useTranslations("tools.word-counter.live.letters");
  const { profile, f, pct } = useWcLive();
  const list = profile.letters;
  const totalLetters = profile.composition.letters;
  const max = Math.max(1, ...list.map((l) => l.count));
  const slot = (W - PAD * 2) / Math.max(list.length, 1);
  const barW = Math.min(20, slot * 0.7);
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const top3 = list.slice(0, 3);
  const top3Share = top3.reduce((a, l) => a + l.count, 0);

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      {list.map((l, i) => {
        const x = PAD + i * slot + (slot - barW) / 2;
        return (
          <g key={l.letter}>
            <rect x={x} y={y(l.count)} width={barW} height={BASE - y(l.count)} rx={3} className={i < 3 ? "fill-blue-600 dark:fill-blue-500" : "fill-blue-300 dark:fill-blue-800"} style={{ transition: "y 250ms ease, height 250ms ease" }} />
            <text x={x + barW / 2} y={y(l.count) - 3} textAnchor="middle" fontSize={9} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">{f(l.count)}</text>
            <text x={x + barW / 2} y={BASE + 16} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">{l.letter}</text>
          </g>
        );
      })}
      <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
    </svg>
  );

  return (
    <WcIndicatorCard
      mini={1}
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("total"), value: f(totalLetters), note: t("totalNote") },
        ...top3.map((l, i) => ({ label: t("rank", { n: f(i + 1), letter: l.letter }), value: pct(totalLetters ? l.count / totalLetters : 0), note: `${f(l.count)} ÷ ${f(totalLetters)}` })),
        { label: t("top3"), value: pct(totalLetters ? top3Share / totalLetters : 0), emphasize: true },
      ]}
    />
  );
}
