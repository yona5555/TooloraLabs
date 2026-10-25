"use client";
import { useTranslations } from "next-intl";
import { GUESS_RATES } from "@tooloralabs/tools";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { pow10Text, SECONDS_PER_YEAR, usePasswordModel } from "./PasswordLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const L = 10;
const R = 10;
const LO = -2;
const HI = 30;
const AXIS_Y = 150;

/** Reference durations in seconds; the universe's age is 13.8 billion years (Planck 2018). */
const MARKS = [
  { key: "second", log10: 0 },
  { key: "day", log10: Math.log10(86400) },
  { key: "year", log10: Math.log10(SECONDS_PER_YEAR) },
  { key: "century", log10: Math.log10(100 * SECONDS_PER_YEAR) },
  { key: "universe", log10: Math.log10(13.8e9 * SECONDS_PER_YEAR) },
];

/**
 * Type #10 (Log-Scale Magnitude Bar): expected time to guess this password at three guess rates on one
 * logarithmic axis from 10 ms to 10³⁰ s, against a second, a day, a year, a century and the age of the universe.
 */
export default function PasswordCrackLadder() {
  const t = useTranslations("tools.password-generator.education.lab.ladder");
  const trate = useTranslations("tools.password-generator.aboveFold.rate");
  const { s, f } = usePasswordModel();
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const x = (v: number) => Math.round((L + ((Math.max(LO, Math.min(HI, v)) - LO) / (HI - LO)) * (W - L - R)) * 100) / 100;
  const COLORS = ["fill-emerald-500 dark:fill-emerald-400", "fill-amber-500 dark:fill-amber-400", "fill-rose-500 dark:fill-rose-400"];
  const H = AXIS_Y + 44;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {GUESS_RATES.map((r, i) => {
        const v = s.log10CrackSeconds[r.key];
        const y = 10 + i * 44;
        return (
          <g key={r.key}>
            <text style={{ fontSize: svgPx(12) }} x={L} y={y + 10} className="fill-zinc-600 dark:fill-zinc-300">
              {trate(r.key)}
            </text>
            <rect x={L} y={y + 16} width={Math.max(3, x(v) - L)} height={14} rx={4} className={COLORS[i]} />
            <text style={{ fontSize: svgPx(12) }}
              x={Math.min(x(v) + 4, W - 4)}
              y={y + 28}
              textAnchor={x(v) > W - 70 ? "end" : "start"}
              fontWeight={700}
              fontFamily="ui-monospace, monospace"
              className={x(v) > W - 70 ? "fill-white" : "fill-zinc-700 dark:fill-zinc-200"}
            >
              {v > HI ? `> 10³⁰ s` : `${pow10Text(v)} s`}
            </text>
          </g>
        );
      })}
      <line x1={L} y1={AXIS_Y} x2={W - R} y2={AXIS_Y} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {MARKS.map((m, i) => (
        <g key={m.key}>
          <line x1={x(m.log10)} y1={8} x2={x(m.log10)} y2={AXIS_Y + 4} strokeDasharray="2 4" className="stroke-zinc-300 dark:stroke-zinc-600" />
          <text style={{ fontSize: svgPx(12) }} x={x(m.log10)} y={AXIS_Y + 18 + (i % 2) * 14} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {t(m.key)}
          </text>
        </g>
      ))}
    </svg>
  );

  const fast = s.log10CrackSeconds.offlineFast;
  const years = fast - Math.log10(SECONDS_PER_YEAR);
  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("keyspace"), value: pow10Text(s.log10Keyspace) },
        { label: t("half"), value: pow10Text(s.log10Keyspace - Math.log10(2)) },
        { label: t("fastYears"), value: years < 0 ? t("underYear") : pow10Text(years) },
        { label: t("vsUniverse"), value: `10^${f(fast - MARKS[4].log10, 1)}` },
        { label: t("formula"), value: `2^${f(s.entropyBits, 1)} / 2 / 10¹¹`, emphasize: true },
      ]}
    />
  );
}
