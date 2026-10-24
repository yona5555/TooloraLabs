"use client";
import { useTranslations } from "next-intl";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 140;
const R = 110;
const MAX = 70;
// Björnsson's LIX bands.
const BANDS = [
  { to: 30, key: "veryEasy", color: "#10b981" },
  { to: 40, key: "easy", color: "#84cc16" },
  { to: 50, key: "medium", color: "#f59e0b" },
  { to: 60, key: "hard", color: "#f97316" },
  { to: 70, key: "veryHard", color: "#e11d48" },
] as const;

const angle = (v: number) => Math.PI * (1 - Math.min(Math.max(v, 0), MAX) / MAX);
const pt = (v: number, r: number) => [CX + r * Math.cos(angle(v)), CY - r * Math.sin(angle(v))] as const;

function arc(from: number, to: number, r: number) {
  const [x0, y0] = pt(from, r);
  const [x1, y1] = pt(to, r);
  return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
}

/** Gradient Gauge (§31 #8): LIX readability (sentence length + share of long words), language-agnostic. */
export default function WcReadabilityGauge() {
  const t = useTranslations("tools.word-counter.live.readability");
  const { profile, stats, f, pct } = useWcLive();
  const lix = profile.lix;
  const band = BANDS.find((b) => lix < b.to) ?? BANDS[BANDS.length - 1];
  const tokens = profile.wordLengths.reduce((a, b) => a + b, 0);
  const longShare = tokens ? profile.longWords / tokens : 0;
  const deg = 180 - (angle(lix) * 180) / Math.PI;

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {BANDS.map((b, i) => (
        <path key={b.key} d={arc(i === 0 ? 0 : BANDS[i - 1].to, b.to, R)} fill="none" stroke={b.color} strokeWidth={20} opacity={b === band ? 1 : 0.45} />
      ))}
      {[0, 30, 40, 50, 60, 70].map((v) => {
        const [x, y] = pt(v, R + 18);
        return <text key={v} x={x} y={y + 3} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">{f(v)}</text>;
      })}
      <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform 400ms cubic-bezier(.3,1.4,.5,1)" }}>
        <line x1={CX} y1={CY} x2={CX - R + 14} y2={CY} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      </g>
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 34} textAnchor="middle" fontSize={26} fontWeight={800} fontFamily="ui-monospace, monospace" className="fill-zinc-900 dark:fill-zinc-50">{f(lix)}</text>
      <text x={CX} y={CY + 26} textAnchor="middle" fontSize={13} fontWeight={700} fill={band.color}>{t(`bands.${band.key}`)}</text>
    </svg>
  );

  return (
    <WcIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("wps"), value: f(profile.averageSentenceLength), note: `${f(stats.words)} ÷ ${f(stats.sentences)}` },
        { label: t("longWords"), value: f(profile.longWords), note: t("longNote") },
        { label: t("longShare"), value: pct(longShare), note: `100 × ${f(profile.longWords)} ÷ ${f(tokens)}` },
        { label: t("lix"), value: f(lix), emphasize: true, note: t("bands." + band.key) },
      ]}
    />
  );
}
