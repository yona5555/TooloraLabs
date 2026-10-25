"use client";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { FILE_FILL, useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;
const L = 40;
const R = 12;
const T = 14;
const B = 34;

/**
 * Type #20 (Annotated Reference Point): each file placed by its byte entropy (bits per byte, 0–8) and
 * the share of its size left after compression. The dashed diagonal is the entropy limit entropy ÷ 8;
 * nothing lossless can land below it.
 */
export default function ZipEntropyScatter() {
  const t = useTranslations("tools.zip-compressor.education.lab.entropy");
  const { ready, rows, f } = useZipModel();
  if (!ready) return <ZipIndicatorUnavailable title={t("title")} />;

  const x = (e: number) => L + (e / 8) * (W - L - R);
  const y = (r: number) => Math.round((H - B - (Math.min(1.05, r) * (H - B - T)) / 1.05) * 100) / 100;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[0, 0.5, 1].map((v) => (
        <g key={v}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text style={{ fontSize: svgPx(12) }} x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
            {v * 100}%
          </text>
        </g>
      ))}
      {[0, 2, 4, 6, 8].map((v) => (
        <text style={{ fontSize: svgPx(12) }} key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {v}
        </text>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
      <line x1={x(0)} y1={y(0)} x2={x(8)} y2={y(1)} strokeDasharray="5 4" strokeWidth={1.5} className="stroke-rose-500 dark:stroke-rose-400" />
      {rows.map((r, i) => (
        <g key={r.name}>
          <circle cx={x(r.entropy)} cy={y(r.ratio)} r={9} strokeWidth={2} className={`${FILE_FILL[i % FILE_FILL.length]} stroke-white dark:stroke-zinc-900`} />
          <text style={{ fontSize: svgPx(12) }} x={Math.min(x(r.entropy) + 12, W - 70)} y={y(r.ratio) + 4} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
            {r.name.length > 10 ? `${r.name.slice(0, 9)}…` : r.name}
          </text>
        </g>
      ))}
    </svg>
  );

  const best = [...rows].sort((a, b) => a.ratio - b.ratio)[0];
  return (
    <ZipIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...rows.slice(0, 3).map((r) => ({ label: r.name, value: `${f(r.entropy, 2)} ${t("bits")} → ${f(r.ratio * 100, 1)}%` })),
        { label: t("limit"), value: `${f(best.entropy, 2)} / 8 = ${f((best.entropy / 8) * 100, 1)}%` },
        { label: t("best"), value: `${best.name} · ${f(best.ratio * 100, 1)}%`, emphasize: true },
      ]}
    />
  );
}
