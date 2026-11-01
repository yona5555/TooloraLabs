"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 104;
const BAR_X = LABEL + 8;
const BAR_W = 170;
const ROW = 40;

/**
 * Type #11 (Side-by-Side Equivalence): the same table as CSV, as minified JSON and as indented JSON,
 * in UTF-8 bytes — JSON repeats every column name on every row.
 */
export default function CsvSizeBars() {
  const t = useTranslations("tools.csv-json-converter.education.lab.sizes");
  const { a, f, pct } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const rows = [
    { key: "csv", v: a.sizes.csv, cls: "fill-emerald-600 dark:fill-emerald-400" },
    { key: "jsonMin", v: a.sizes.jsonMin, cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "jsonPretty", v: a.sizes.jsonPretty, cls: "fill-blue-300 dark:fill-blue-700" },
  ];
  const peak = Math.max(...rows.map((r) => r.v), 1);
  const H = rows.length * ROW + 4;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = i * ROW;
        const w = Math.max(3, (r.v / peak) * BAR_W);
        return (
          <g key={r.key}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 22} textAnchor="end" fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(r.key)}
            </text>
            <rect x={BAR_X} y={y + 8} width={w} height={ROW - 16} rx={4} className={r.cls} />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + 22} fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
              {f(r.v)} B
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      mini={1}
      indicator={svg}
      rows={[
        { label: t("csv"), value: `${f(a.sizes.csv)} B` },
        { label: t("jsonMin"), value: `${f(a.sizes.jsonMin)} B (+${pct(a.sizes.jsonMin - a.sizes.csv, a.sizes.csv)})` },
        { label: t("jsonPretty"), value: `${f(a.sizes.jsonPretty)} B (+${pct(a.sizes.jsonPretty - a.sizes.csv, a.sizes.csv)})` },
        { label: t("perRow"), value: `${f(a.sizes.csv / Math.max(1, a.rows.length + 1), 1)} / ${f(a.sizes.jsonMin / Math.max(1, a.rows.length), 1)} B` },
        { label: t("ratio"), value: `× ${f(a.sizes.jsonMin / Math.max(1, a.sizes.csv), 2)}`, emphasize: true },
      ]}
    />
  );
}
