"use client";
import { useTranslations } from "next-intl";
import { COLUMN_TYPES } from "@tooloralabs/tools";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { TYPE_FILL, useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;

function ring(r0: number, r1: number, t0: number, t1: number) {
  const span = Math.min(t1 - t0, 0.9999);
  const a0 = t0 * 2 * Math.PI - Math.PI / 2;
  const a1 = (t0 + span) * 2 * Math.PI - Math.PI / 2;
  const lg = span > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)} Z`;
}

/**
 * Type #6 (Donut): the type each column's values agree on — integer, decimal, boolean, ISO date,
 * text or empty. CSV stores everything as text; this is what a typed consumer would read back.
 */
export default function CsvTypeDonut() {
  const t = useTranslations("tools.csv-json-converter.education.lab.typeShare");
  const tt = useTranslations("tools.csv-json-converter.education.lab.types");
  const { a, f, pct } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const counts = COLUMN_TYPES.map((ty) => a.columns.filter((c) => c.type === ty).length);
  const total = a.columns.length;
  const cum = counts.map((_, i) => [counts.slice(0, i).reduce((s, v) => s + v, 0) / total, counts.slice(0, i + 1).reduce((s, v) => s + v, 0) / total]);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {COLUMN_TYPES.map((ty, i) =>
        counts[i] > 0 ? <path key={ty} d={ring(52, 88, cum[i][0], cum[i][1])} className={`${TYPE_FILL[ty]} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null,
      )}
      <text style={{ fontSize: svgPx(20) }} x={CX} y={CY - 2} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(total)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={CX} y={CY + 15} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("columns")}
      </text>
      {COLUMN_TYPES.map((ty, i) => {
        const y = 20 + i * 27;
        return (
          <g key={ty} opacity={counts[i] ? 1 : 0.4}>
            <circle cx={208} cy={y} r={6} className={TYPE_FILL[ty]} />
            <text style={{ fontSize: svgPx(12) }} x={220} y={y + 4} className="fill-zinc-600 dark:fill-zinc-300">
              {tt(ty)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W - 4} y={y + 4} textAnchor="end" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(counts[i])}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const numeric = counts[0] + counts[1];
  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      mini={0}
      indicator={svg}
      rows={[
        { label: t("numeric"), value: `${f(numeric)} (${pct(numeric, total)})` },
        { label: t("text"), value: f(counts[4]) },
        {
          label: t("typed"),
          value:
            a.columns
              .filter((c) => c.type !== "text" && c.type !== "empty")
              .map((c) => c.name)
              .join(", ") || "—",
        },
        { label: t("note"), value: t("noteValue") },
        { label: t("total"), value: f(total), emphasize: true },
      ]}
    />
  );
}
