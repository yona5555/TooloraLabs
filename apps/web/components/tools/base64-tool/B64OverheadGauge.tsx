"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;
const MAX = 100;

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};

/**
 * Type #8 (Gradient Gauge): size overhead of Base64 over the raw bytes. Long inputs approach the
 * theoretical 33.3 %; tiny inputs pay more because the last group is padded to four characters.
 */
export default function B64OverheadGauge() {
  const t = useTranslations("tools.base64-tool.education.lab.overhead");
  const { a, f } = useB64Model();
  if (!a || a.byteCount === 0) return <B64IndicatorUnavailable title={t("title")} />;

  const over = ((a.paddedLength - a.byteCount) / a.byteCount) * 100;
  const frac = Math.min(1, over / MAX);
  const [nx, ny] = pt(frac, R - 20);
  const theory = 100 / 3;
  const [tx0, ty0] = pt(theory / MAX, R - 14);
  const [tx1, ty1] = pt(theory / MAX, R + 12);
  const zones = [
    { from: 0, to: 0.36, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
    { from: 0.36, to: 0.6, cls: "stroke-amber-400 dark:stroke-amber-500" },
    { from: 0.6, to: 1, cls: "stroke-rose-400 dark:stroke-rose-500" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => {
        const [x0, y0] = pt(z.from + 0.004, R);
        const [x1, y1] = pt(z.to - 0.004, R);
        return <path key={z.from} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={20} className={z.cls} />;
      })}
      <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} strokeWidth={2.5} className="stroke-zinc-700 dark:stroke-zinc-200" />
      {[0, 25, 50, 75, 100].map((v) => {
        const [x, y] = pt(v / MAX, R + 24);
        return (
          <text key={v} x={x} y={Number(y) + 4} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
            {v}%
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 38} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        +{f(over, 1)}%
      </text>
    </svg>
  );

  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      mini={0}
      indicator={svg}
      rows={[
        { label: t("extra"), value: `${f(a.paddedLength - a.byteCount)} ${t("chars")}` },
        { label: t("theory"), value: "+33.3%" },
        { label: t("padCost"), value: `${f(((a.paddedLength - (a.byteCount * 4) / 3) / a.byteCount) * 100, 1)} pt` },
        { label: t("mime"), value: `+${f(((a.mimeLength - a.byteCount) / a.byteCount) * 100, 1)}%` },
        { label: t("overhead"), value: `+${f(over, 2)}%`, emphasize: true },
      ]}
    />
  );
}
