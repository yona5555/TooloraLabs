"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 260;
const H = 170;
const CX = W / 2;
const CY = 130;
const R = 100;
const LIMIT = 60;

function polar(angle: number, r: number): [number, number] {
  return [CX + r * Math.cos(angle), CY - r * Math.sin(angle)];
}

export function cvZone(cv: number): "low" | "moderate" | "high" {
  return cv < 10 ? "low" : cv <= 30 ? "moderate" : "high";
}

/** Type #8 (Gradient Gauge): coefficient of variation σ / |μ| × 100 on a 0–60 % dial — low (< 10 %), moderate (10–30 %), high (> 30 %). */
export default function SdCvGauge() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.cv");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const { a, f } = useSdModel();
  if (!a) return null;

  const cv = a.coefficientOfVariation;
  const clamped = Math.max(0, Math.min(LIMIT, cv ?? 0));
  const angle = Math.PI * (1 - clamped / LIMIT);
  const [nx, ny] = polar(angle, R - 18);
  const [sx0, sy0] = polar(Math.PI, R);
  const [sx1, sy1] = polar(0, R);
  const ticks = [0, 10, 20, 30, 40, 50, 60];

  const gauge = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <defs>
        <linearGradient id="sd-cv-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="16%" stopColor="#10b981" />
          <stop offset="34%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <path d={`M ${sx0} ${sy0} A ${R} ${R} 0 0 1 ${sx1} ${sy1}`} fill="none" stroke="url(#sd-cv-grad)" strokeWidth={16} strokeLinecap="round" />
      {ticks.map((v) => {
        const [tx, ty] = polar(Math.PI * (1 - v / LIMIT), R - 24);
        return (
          <text key={v} x={tx} y={ty + 4} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {`${v}%`}
          </text>
        );
      })}
      {cv !== null && (
        <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={3.5} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" style={{ transition: "all 500ms ease" }} />
      )}
      <circle cx={CX} cy={CY} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY + 26} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {cv === null ? tl("cvUndefined") : `${f(cv, 1)}% · ${t(`zones.${cvZone(cv)}`)}`}
      </text>
    </svg>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={gauge}
      rows={[
        { label: "σ", value: f(a.populationStdDev, 4) },
        { label: "|μ|", value: f(Math.abs(a.mean), 4) },
        { label: t("formula"), value: `${f(a.populationStdDev)} / ${f(Math.abs(a.mean))} × 100` },
        { label: tl("cv"), value: cv === null ? tl("cvUndefined") : `${f(cv, 2)}%`, emphasize: true, note: cv === null ? undefined : t(`zones.${cvZone(cv)}`) },
        { label: t("sampleCv"), value: a.mean !== 0 ? `${f((a.sampleStdDev / Math.abs(a.mean)) * 100, 2)}%` : tl("cvUndefined") },
      ]}
    />
  );
}
