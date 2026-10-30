"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { TYPE_BG, TYPE_FILL, useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 180;

/**
 * Interactive piece: pick any column. Numeric columns show every row's value as a bar with the mean
 * line; other columns show their most frequent values. The profile beside it comes from the parsed cells.
 */
export default function CsvColumnExplorer() {
  const t = useTranslations("tools.csv-json-converter.education.lab.explorer");
  const tt = useTranslations("tools.csv-json-converter.education.lab.types");
  const { a, f } = useCsvModel();
  const [pick, setPick] = useState(0);
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const ci = Math.min(pick, a.columns.length - 1);
  const col = a.columns[ci];
  const values = a.rows.map((r) => r[ci]).slice(0, 30);

  let chart: React.ReactNode;
  if (col.numeric) {
    const nums = values.map((v) => (v === "" ? null : Number(v)));
    const lo = Math.min(0, col.numeric.min);
    const hi = Math.max(col.numeric.max, lo + 1e-9);
    const base = H - 24;
    const y = (v: number) => base - ((v - lo) / (hi - lo)) * (base - 16);
    const slot = W / nums.length;
    chart = (
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <line x1={0} y1={y(0)} x2={W} y2={y(0)} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {nums.map((v, i) =>
          v === null ? (
            <text style={{ fontSize: svgPx(12) }} key={i} x={i * slot + slot / 2} y={base - 4} textAnchor="middle" className="fill-amber-500">
              ∅
            </text>
          ) : (
            <rect key={i} x={i * slot + slot * 0.15} y={Math.min(y(v), y(0))} width={slot * 0.7} height={Math.max(1, Math.abs(y(0) - y(v)))} rx={2} className={TYPE_FILL[col.type]} />
          ),
        )}
        <line x1={0} y1={y(col.numeric.mean)} x2={W} y2={y(col.numeric.mean)} strokeDasharray="5 4" strokeWidth={1.5} className="stroke-rose-500 dark:stroke-rose-400" />
        <text style={{ fontSize: svgPx(12) }} x={W - 2} y={y(col.numeric.mean) - 5} textAnchor="end" fontWeight={700} className="fill-rose-600 dark:fill-rose-300">
          {t("mean", { v: f(col.numeric.mean, 2) })}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={0} y={H - 6} className="fill-zinc-500 dark:fill-zinc-400">
          {t("rowsAxis", { n: nums.length })}
        </text>
      </svg>
    );
  } else {
    const peak = Math.max(...col.top.map((x) => x.count), 1);
    chart = (
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {col.top.map((x, i) => {
          const y = 8 + i * 32;
          const w = Math.max(4, (x.count / peak) * 150);
          return (
            <g key={x.value}>
              <text style={{ fontSize: svgPx(12) }} x={120} y={y + 16} textAnchor="end" fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
                {x.value.length > 14 ? `${x.value.slice(0, 13)}…` : x.value}
              </text>
              <rect x={128} y={y + 4} width={w} height={18} rx={3} className={TYPE_FILL[col.type]} />
              <text style={{ fontSize: svgPx(12) }} x={134 + w} y={y + 17} fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
                ×{x.count}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  const indicator = (
    <div className="w-[340px] max-w-full">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {a.columns.map((c, i) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setPick(i)}
            aria-pressed={i === ci}
            className={`rounded-full px-2.5 py-1 font-mono text-xs font-semibold transition ${i === ci ? `${TYPE_BG[c.type]} text-white` : "border border-zinc-300 text-zinc-600 hover:border-blue-400 dark:border-zinc-600 dark:text-zinc-300"}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      {chart}
    </div>
  );

  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("type"), value: tt(col.type) },
        { label: t("filled"), value: `${f(col.filled)} / ${f(col.filled + col.empty)}` },
        { label: t("distinct"), value: f(col.distinct) },
        col.numeric ? { label: t("range"), value: `${f(col.numeric.min, 2)} – ${f(col.numeric.max, 2)}` } : { label: t("longest"), value: t("chars", { n: col.maxLength }) },
        { label: t("column"), value: `${col.name} (${ci + 1}/${a.columns.length})`, emphasize: true },
      ]}
    />
  );
}
