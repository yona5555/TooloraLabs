"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const L = 30;
const R = 10;
const T = 16;
const B = 32;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): fields found on each data row against the
 * header's width (dashed). Short rows are padded with empty cells; long rows lose their extra fields.
 */
export default function CsvRowLengths() {
  const t = useTranslations("tools.csv-json-converter.education.lab.rows");
  const { a, f } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const lens = a.rowLengths.slice(0, 60);
  const width = a.headers.length;
  const maxY = Math.max(width, ...lens) + 1;
  const n = Math.max(lens.length, 2);
  const x = (i: number) => L + (i / (n - 1)) * (W - L - R);
  const y = (v: number) => H - B - (v / maxY) * (H - B - T);
  const line = lens.map((v, i) => `${i ? "L" : "M"} ${x(i)} ${y(v)}`).join(" ");
  const short = a.rowLengths.filter((v) => v < width).length;
  const long = a.rowLengths.filter((v) => v > width).length;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[0, width, maxY].map((v) => (
        <text style={{ fontSize: svgPx(12) }} key={v} x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
          {v}
        </text>
      ))}
      <line x1={L} y1={y(width)} x2={W - R} y2={y(width)} strokeDasharray="5 4" strokeWidth={1.5} className="stroke-emerald-500 dark:stroke-emerald-400" />
      <text style={{ fontSize: svgPx(12) }} x={W - R} y={y(width) - 6} textAnchor="end" fontWeight={600} className="fill-emerald-700 dark:fill-emerald-300">
        {t("header", { n: width })}
      </text>
      <path d={line} fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
      {lens.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={v === width ? 3.5 : 5.5} className={v === width ? "fill-blue-600 dark:fill-blue-400" : v < width ? "fill-amber-500" : "fill-rose-500"} />
      ))}
      <text style={{ fontSize: svgPx(12) }} x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
    </FitSvg>
  );

  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("rows"), value: f(a.rowLengths.length) },
        { label: t("width"), value: f(width) },
        { label: t("short"), value: f(short) },
        { label: t("long"), value: f(long) },
        { label: t("clean"), value: short + long === 0 ? t("yes") : t("no"), emphasize: true },
      ]}
    />
  );
}
