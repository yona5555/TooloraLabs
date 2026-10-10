"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { normalCdf, normalPdf } from "@tooloralabs/tools";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 320;
const H = 190;
const BASE = 150;
const TOP = 26;
const ZMAX = 3.6;

/**
 * Type #20 (Annotated Reference Point): a normal curve with the data's own μ and σ; pick any value
 * and it is pinned on the curve with its z-score, while the area to its left (its normal
 * percentile Φ(z)) fills in. Picking is a live control — it re-reads the data on every edit.
 */
export default function SdBellReference() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.bell");
  const { a, f, pct } = useSdModel();
  const [picked, setPicked] = useState<number | null>(null);
  if (!a) return null;

  const distinct = [...new Set(a.sorted)];
  const chips = distinct.length > 12 ? distinct.filter((_, i) => i % Math.ceil(distinct.length / 12) === 0 || i === distinct.length - 1) : distinct;
  const value = picked !== null && distinct.includes(picked) ? picked : a.farthest.value;
  const sigma = a.populationStdDev;
  const z = sigma > 0 ? (value - a.mean) / sigma : 0;
  const zc = Math.max(-ZMAX, Math.min(ZMAX, z));
  const phi = normalCdf(z);

  const sx = (zz: number) => 10 + ((zz + ZMAX) / (2 * ZMAX)) * (W - 20);
  const sy = (zz: number) => BASE - (normalPdf(zz) / normalPdf(0)) * (BASE - TOP);
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const zz = -ZMAX + (i / 120) * 2 * ZMAX;
    pts.push(`${sx(zz).toFixed(1)},${sy(zz).toFixed(1)}`);
  }
  const fill: string[] = [`${sx(-ZMAX)},${BASE}`];
  for (let i = 0; i <= 120; i++) {
    const zz = -ZMAX + (i / 120) * (zc + ZMAX);
    fill.push(`${sx(zz).toFixed(1)},${sy(zz).toFixed(1)}`);
  }
  fill.push(`${sx(zc)},${BASE}`);
  const labelX = Math.max(60, Math.min(W - 60, sx(zc)));

  const indicator = (
    <div className="w-full max-w-[320px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
        <polygon points={fill.join(" ")} className="fill-blue-200 dark:fill-blue-500/30" />
        <polyline points={pts.join(" ")} fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
        <line x1={10} y1={BASE} x2={W - 10} y2={BASE} className="stroke-zinc-400 dark:stroke-zinc-500" />
        {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
          <g key={k}>
            <line x1={sx(k)} y1={BASE} x2={sx(k)} y2={BASE + 4} className="stroke-zinc-400 dark:stroke-zinc-500" />
            <text x={sx(k)} y={BASE + 15} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
              {k === 0 ? "μ" : `${k > 0 ? "+" : "−"}${Math.abs(k)}σ`}
            </text>
            {(k === -2 || k === 0 || k === 2) && (
              <text x={sx(k)} y={BASE + 27} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
                {f(a.mean + k * sigma, 2)}
              </text>
            )}
          </g>
        ))}
        <line x1={sx(zc)} y1={sy(zc) - 6} x2={sx(zc)} y2={BASE} strokeWidth={2} className="stroke-rose-600 dark:stroke-rose-400" />
        <circle cx={sx(zc)} cy={sy(zc)} r={5} className="fill-rose-600 dark:fill-rose-400" />
        <text x={labelX} y={14} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-rose-700 dark:fill-rose-300">
          {`x = ${f(value)} · z = ${f(z, 2)} · Φ = ${pct(phi)}`}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5" role="group" aria-label={t("pick")}>
        {chips.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setPicked(v)}
            aria-pressed={v === value}
            className={`rounded-md border px-2 py-0.5 font-mono text-xs transition ${
              v === value
                ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400 dark:bg-rose-500/15 dark:text-rose-300"
                : "border-zinc-200 text-zinc-600 hover:border-rose-300 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {f(v)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("value"), value: f(value, 4) },
        { label: "z", value: `(${f(value)} − ${f(a.mean)}) / ${f(sigma)} = ${f(z, 3)}` },
        { label: t("below"), value: `Φ(${f(z, 2)}) = ${pct(phi)}`, emphasize: true },
        { label: t("above"), value: pct(1 - phi) },
        { label: t("actualBelow"), value: `${a.sorted.filter((v) => v < value).length}/${a.n}` },
      ]}
    />
  );
}
