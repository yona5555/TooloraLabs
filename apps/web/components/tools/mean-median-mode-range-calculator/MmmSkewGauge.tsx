"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";
import { shapeKey } from "./MmmLive3D";

const W = 260;
const H = 160;
const CX = W / 2;
const CY = 128;
const R = 100;
const LIMIT = 3;

function polar(angle: number, r: number): [number, number] {
  // Rounded: server (Node) and browser trig can differ in the last digit, which breaks hydration.
  return [Math.round((CX + r * Math.cos(angle)) * 1000) / 1000, Math.round((CY - r * Math.sin(angle)) * 1000) / 1000];
}

/** Type #8 (Gradient Gauge): Pearson's second skewness 3(x̄ − median)/s on a −3…+3 dial — left-skewed, symmetric, right-skewed. */
export default function MmmSkewGauge() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.skew");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const tl = useTranslations("tools.mean-median-mode-range-calculator.live3d");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const clamped = Math.max(-LIMIT, Math.min(LIMIT, a.pearsonSkew));
  const angle = Math.PI * (1 - (clamped + LIMIT) / (2 * LIMIT));
  const [nx, ny] = polar(angle, R - 18);
  const [sx0, sy0] = polar(Math.PI, R);
  const [sx1, sy1] = polar(0, R);
  const ticks = [-3, -2, -1, 0, 1, 2, 3];

  const gauge = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <defs>
        <linearGradient id="mmm-skew-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d={`M ${sx0} ${sy0} A ${R} ${R} 0 0 1 ${sx1} ${sy1}`} fill="none" stroke="url(#mmm-skew-grad)" strokeWidth={16} strokeLinecap="round" />
      {ticks.map((v) => {
        const ang = Math.PI * (1 - (v + LIMIT) / (2 * LIMIT));
        const [tx, ty] = polar(ang, R - 22);
        return (
          <text key={v} x={tx} y={ty + 4} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {v > 0 ? `+${v}` : String(v)}
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={3.5} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" style={{ transition: "all 500ms ease" }} />
      <circle cx={CX} cy={CY} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY + 24} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {`${f(a.pearsonSkew, 2)} · ${tl(`shapes.${shapeKey(a.pearsonSkew)}`)}`}
      </text>
    </svg>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={gauge}
      rows={[
        { label: tr("mean"), value: f(a.mean) },
        { label: tr("median"), value: f(a.median) },
        { label: tl("sampleSd"), value: f(a.sampleStdDev) },
        { label: t("formula"), value: `3 × (${f(a.mean)} − ${f(a.median)}) / ${f(a.sampleStdDev)}` },
        { label: tl("skew"), value: f(a.pearsonSkew), emphasize: true, note: tl(`shapes.${shapeKey(a.pearsonSkew)}`) },
      ]}
    />
  );
}
