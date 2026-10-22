"use client";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { useBarcodeModel } from "./BarcodeLiveContext";

const W = 300;
const H = 180;
const CX = W / 2;
const CY = 150;
const R = 112;

function arc(r: number, f0: number, f1: number): string {
  const a0 = Math.PI * (1 - f0);
  const a1 = Math.PI * (1 - f1);
  const p = (a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY - r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
}

/**
 * Type #8 (Gradient Gauge): share of the symbol's modules that are printed dark. Bar codes built from
 * balanced bar/space widths sit near half; the needle shows this symbol's exact ink coverage.
 */
export default function BarcodeInkGauge() {
  const t = useTranslations("tools.barcode-generator.education.lab.ink");
  const { a, f, pct } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const share = a.darkModules / a.modules;
  // Gauge spans 30 %–70 % so small differences between symbols stay visible.
  const lo = 0.3;
  const hi = 0.7;
  const pos = Math.min(1, Math.max(0, (share - lo) / (hi - lo)));
  const needle = Math.PI * (1 - pos);
  const zones = [
    { from: 0, to: 0.375, cls: "stroke-sky-300 dark:stroke-sky-700" },
    { from: 0.375, to: 0.625, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
    { from: 0.625, to: 1, cls: "stroke-zinc-500 dark:stroke-zinc-400" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => (
        <path key={z.from} d={arc(R, z.from + 0.004, z.to - 0.004)} fill="none" strokeWidth={20} className={z.cls} />
      ))}
      {[0.3, 0.4, 0.5, 0.6, 0.7].map((v) => {
        const p = (v - lo) / (hi - lo);
        const ang = Math.PI * (1 - p);
        return (
          <text key={v} x={(CX + (R + 22) * Math.cos(ang)).toFixed(2)} y={(CY - (R + 22) * Math.sin(ang) + 4).toFixed(2)} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
            {Math.round(v * 100)}%
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={(CX + (R - 18) * Math.cos(needle)).toFixed(2)} y2={(CY - (R - 18) * Math.sin(needle)).toFixed(2)} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 34} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {pct(a.darkModules, a.modules)}
      </text>
    </svg>
  );

  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("dark"), value: f(a.darkModules) },
        { label: t("light"), value: f(a.modules - a.darkModules) },
        { label: t("ratio"), value: `1 : ${f((a.modules - a.darkModules) / a.darkModules, 2)}` },
        { label: t("fromHalf"), value: `${share >= 0.5 ? "+" : "−"}${f(Math.abs(share - 0.5) * 100, 1)} pt` },
        { label: t("coverage"), value: pct(a.darkModules, a.modules), emphasize: true },
      ]}
    />
  );
}
