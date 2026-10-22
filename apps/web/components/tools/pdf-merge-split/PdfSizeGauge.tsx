"use client";
import { useTranslations } from "next-intl";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { formatBytes, usePdfModel } from "./PdfLiveContext";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;
const LO = -50;
const HI = 150;

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};

/**
 * Type #8 (Gradient Gauge): total output size against total input size, from −50 % to +150 %.
 * Merging can share fonts and shrink; splitting copies shared resources into every part and grows.
 */
export default function PdfSizeGauge() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.gauge");
  const { draft, ready, inputBytes, outputBytes, f } = usePdfModel();
  if (!ready || inputBytes === 0) return <PdfIndicatorUnavailable title={t("title")} />;

  const change = ((outputBytes - inputBytes) / inputBytes) * 100;
  const frac = Math.min(1, Math.max(0, (change - LO) / (HI - LO)));
  const [nx, ny] = pt(frac, R - 20);
  const zero = (0 - LO) / (HI - LO);
  const zones = [
    { from: 0, to: zero, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
    { from: zero, to: 0.5, cls: "stroke-amber-400 dark:stroke-amber-500" },
    { from: 0.5, to: 1, cls: "stroke-rose-400 dark:stroke-rose-500" },
  ];
  const parts = Math.max(1, draft.outputSizes.length);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => {
        const [x0, y0] = pt(z.from + 0.004, R);
        const [x1, y1] = pt(z.to - 0.004, R);
        return <path key={z.from} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={20} className={z.cls} />;
      })}
      {[-50, 0, 50, 100, 150].map((v) => {
        const [x, y] = pt((v - LO) / (HI - LO), R + 24);
        return (
          <text key={v} x={x} y={Number(y) + 4} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
            {v > 0 ? "+" : ""}
            {v}%
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 38} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {change >= 0 ? "+" : "−"}
        {f(Math.abs(change), 1)}%
      </text>
    </svg>
  );

  return (
    <PdfIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("input"), value: formatBytes(inputBytes) },
        { label: t("output"), value: formatBytes(outputBytes) },
        { label: t("files"), value: f(parts) },
        { label: t("perFile"), value: formatBytes(outputBytes / parts) },
        { label: t("change"), value: `${change >= 0 ? "+" : "−"}${f(Math.abs(change), 2)}%`, emphasize: true },
      ]}
    />
  );
}
