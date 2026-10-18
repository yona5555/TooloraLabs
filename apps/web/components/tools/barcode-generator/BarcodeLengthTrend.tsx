"use client";
import { useTranslations } from "next-intl";
import { code128Modules } from "@tooloralabs/tools";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { useBarcodeModel } from "./BarcodeLiveContext";

const W = 340;
const H = 210;
const L = 40;
const R = 10;
const T = 14;
const B = 34;
const MAX_N = 24;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): symbol width in modules versus number of
 * characters. Code 128 grows by 11 modules per character; UPC-A and EAN-13 are fixed at 95 modules.
 * The point marks the value on the page.
 */
export default function BarcodeLengthTrend() {
  const t = useTranslations("tools.barcode-generator.education.lab.length");
  const { a, f } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const n = [...a.fullText].length;
  const isCode128 = a.symbology === "code128";
  const maxN = Math.max(MAX_N, isCode128 ? n : 13);
  const maxY = code128Modules(maxN);
  const x = (k: number) => L + ((k - 1) / (maxN - 1)) * (W - L - R);
  const y = (m: number) => H - B - (m / maxY) * (H - B - T);
  const line = Array.from({ length: maxN }, (_, i) => `${i ? "L" : "M"} ${x(i + 1).toFixed(1)} ${y(code128Modules(i + 1)).toFixed(1)}`).join(" ");
  const cross = (95 - 35) / 11; // code128Modules(k) = 95 → k ≈ 5.45 characters
  const px = isCode128 ? x(n) : x(a.symbology === "upc-a" ? 12 : 13);
  const py = isCode128 ? y(a.modules) : y(95);
  const ticks = [0, Math.round(maxY / 2 / 50) * 50, Math.floor(maxY / 50) * 50];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
            {v}
          </text>
        </g>
      ))}
      {[1, Math.round(maxN / 2), maxN].map((k) => (
        <text key={k} x={x(k)} y={H - B + 16} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
          {k}
        </text>
      ))}
      <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axisX")}
      </text>
      <line x1={L} y1={y(95)} x2={W - R} y2={y(95)} strokeDasharray="5 4" strokeWidth={1.5} className="stroke-emerald-500 dark:stroke-emerald-400" />
      <text x={W - R} y={y(95) - 6} textAnchor="end" fontSize={12} fontWeight={600} className="fill-emerald-700 dark:fill-emerald-300">
        {t("eanLine")}
      </text>
      <path d={line} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      <text x={x(maxN) - 4} y={y(code128Modules(maxN)) + 16} textAnchor="end" fontSize={12} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
        Code 128
      </text>
      <circle cx={px} cy={py} r={7} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" strokeWidth={2} />
      <text x={Math.min(px + 10, W - 70)} y={py - 10} fontSize={12} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
        {t("you", { m: f(isCode128 ? a.modules : 95) })}
      </text>
    </svg>
  );

  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("chars"), value: f(n) },
        { label: t("code128Formula"), value: `11 × (${f(n)} + 2) + 13 = ${f(code128Modules(n))}` },
        { label: t("ean"), value: "95" },
        { label: t("breakEven"), value: t("breakEvenValue", { n: f(cross, 1) }) },
        { label: t("perChar"), value: f((isCode128 ? a.modules : 95) / n, 2), emphasize: true },
      ]}
    />
  );
}
