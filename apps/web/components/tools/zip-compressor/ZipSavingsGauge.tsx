"use client";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { formatBytes, useZipModel } from "./ZipLiveContext";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};

/**
 * Type #8 (Gradient Gauge): space saved by the whole archive (headers included), from 0 to 100 %.
 * A negative saving — archive larger than the files — pins the needle at zero and says so.
 */
export default function ZipSavingsGauge() {
  const t = useTranslations("tools.zip-compressor.education.lab.savings");
  const { ready, original, compressed, f } = useZipModel();
  if (!ready || original === 0) return <ZipIndicatorUnavailable title={t("title")} />;

  const saved = (original - compressed) / original;
  const [nx, ny] = pt(Math.max(0, Math.min(1, saved)), R - 20);
  const zones = [
    { from: 0, to: 0.2, cls: "stroke-zinc-300 dark:stroke-zinc-600" },
    { from: 0.2, to: 0.5, cls: "stroke-sky-400 dark:stroke-sky-600" },
    { from: 0.5, to: 1, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => {
        const [x0, y0] = pt(z.from + 0.004, R);
        const [x1, y1] = pt(z.to - 0.004, R);
        return <path key={z.from} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={20} className={z.cls} />;
      })}
      {[0, 25, 50, 75, 100].map((v) => {
        const [x, y] = pt(v / 100, R + 24);
        return (
          <text key={v} x={x} y={Number(y) + 4} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
            {v}%
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 38} textAnchor="middle" fontSize={22} fontWeight={700} className={saved < 0 ? "fill-rose-600 dark:fill-rose-300" : "fill-blue-700 dark:fill-blue-300"}>
        {saved < 0 ? "+" : "−"}
        {f(Math.abs(saved) * 100, 1)}%
      </text>
    </svg>
  );

  return (
    <ZipIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("original"), value: formatBytes(original) },
        { label: t("archive"), value: formatBytes(compressed) },
        { label: t("savedBytes"), value: `${saved < 0 ? "−" : ""}${formatBytes(Math.abs(original - compressed))}` },
        { label: t("ratio"), value: `${f(original / compressed, 2)} : 1` },
        { label: t("saved"), value: `${f(saved * 100, 2)}%`, emphasize: true },
      ]}
    />
  );
}
