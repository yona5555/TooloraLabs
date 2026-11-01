"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { usePasswordModel } from "./PasswordLiveContext";
import { getStrengthTier, STRENGTH_TIER_ORDER } from "./crackTime";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;
const MAX = 128;
const BOUNDS = [0, 28, 36, 60, 100, MAX];
const ZONE = ["stroke-red-500", "stroke-orange-500", "stroke-yellow-500", "stroke-emerald-500", "stroke-blue-600"];

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY - r * Math.sin(a)).toFixed(2)}`;
};

/**
 * Type #8 (Gradient Gauge): entropy in bits on the tool's five strength bands (28 / 36 / 60 / 100
 * bits), capped at 128; the needle follows every setting change.
 */
export default function PasswordEntropyGauge() {
  const t = useTranslations("tools.password-generator.education.lab.gauge");
  const tt = useTranslations("tools.password-generator.aboveFold.tier");
  const { s, f } = usePasswordModel();
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const tier = getStrengthTier(s.entropyBits);
  const frac = Math.min(1, s.entropyBits / MAX);
  const [nx, ny] = pt(frac, R - 20).split(" ");
  const next = BOUNDS.slice(1, -1).find((b) => b > s.entropyBits);

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {BOUNDS.slice(0, -1).map((b, i) => (
        <path key={b} d={`M ${pt(b / MAX + 0.003, R)} A ${R} ${R} 0 0 1 ${pt(BOUNDS[i + 1] / MAX - 0.003, R)}`} fill="none" strokeWidth={20} className={ZONE[i]} />
      ))}
      {BOUNDS.map((b) => {
        const [x, y] = pt(b / MAX, R + 22).split(" ");
        return (
          <text style={{ fontSize: svgPx(12) }} key={b} x={x} y={Number(y) + 4} textAnchor={Number(x) > W - 40 ? "end" : Number(x) < 40 ? "start" : "middle"} className="fill-zinc-500 dark:fill-zinc-400">
            {b}
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text style={{ fontSize: svgPx(22) }} x={CX} y={CY - 42} textAnchor="middle" fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {f(s.entropyBits, 1)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={CX} y={CY - 24} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {tt(tier)}
      </text>
    </FitSvg>
  );

  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={0} title={t("title")}>{svg}</PhoneMini>}
      rows={[
        { label: t("band"), value: `${STRENGTH_TIER_ORDER.indexOf(tier) + 1} / 5 · ${tt(tier)}` },
        { label: t("next"), value: next ? `+${f(next - s.entropyBits, 1)} → ${next}` : "—" },
        { label: t("keyspace"), value: `2^${f(s.entropyBits, 1)}` },
        { label: t("of128"), value: `${f(Math.min(100, (s.entropyBits / MAX) * 100), 1)}%` },
        { label: t("bits"), value: f(s.entropyBits, 2), emphasize: true },
      ]}
    />
  );
}
