"use client";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { delimiterName, useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const STEP = 46;
const PILL_W = 220;

/**
 * Type #3 (Hierarchical Flow): what the converter did with your text — lines, the header, data rows,
 * fields split on the delimiter (quoted fields kept whole) and the records or CSV lines produced.
 */
export default function CsvParseFlow() {
  const t = useTranslations("tools.csv-json-converter.education.lab.flow");
  const { draft, a, result, delimiter, f } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const toJson = draft.mode === "csvToJson";
  const fields = a.rows.length * a.headers.length;
  const steps = toJson
    ? [
        { label: t("lines"), value: f(a.lines), cls: "fill-zinc-500 dark:fill-zinc-400" },
        { label: draft.hasHeader ? t("header") : t("generated"), value: f(a.headers.length), cls: "fill-amber-500 dark:fill-amber-400" },
        { label: t("dataRows"), value: f(a.rows.length), cls: "fill-sky-500 dark:fill-sky-400" },
        { label: t("fields", { d: delimiterName(delimiter) }), value: f(fields), cls: "fill-blue-600 dark:fill-blue-400" },
        { label: t("objects"), value: f(a.rows.length), cls: "fill-emerald-600 dark:fill-emerald-400" },
      ]
    : [
        { label: t("records"), value: f(a.rows.length), cls: "fill-zinc-500 dark:fill-zinc-400" },
        { label: t("flatKeys"), value: f(a.headers.length), cls: "fill-amber-500 dark:fill-amber-400" },
        { label: t("cells"), value: f(fields), cls: "fill-blue-600 dark:fill-blue-400" },
        { label: t("quoted"), value: f(a.quotedFields), cls: "fill-violet-500 dark:fill-violet-400" },
        { label: t("csvLines"), value: f(result.split("\n").length), cls: "fill-emerald-600 dark:fill-emerald-400" },
      ];
  const H = steps.length * STEP;
  const x0 = (W - PILL_W) / 2;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {steps.map((s, i) => {
        const y = i * STEP + 4;
        return (
          <g key={i}>
            {i < steps.length - 1 && <path d={`M ${W / 2} ${y + 30} V ${y + STEP} m -5 -7 l 5 7 l 5 -7`} fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />}
            <rect x={x0} y={y} width={PILL_W} height={30} rx={15} className={s.cls} />
            <text style={{ fontSize: svgPx(12) }} x={x0 + 14} y={y + 20} fontWeight={600} className="fill-white">
              {s.label}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x0 + PILL_W - 14} y={y + 20} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-white">
              {s.value}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t(toJson ? "introCsv" : "introJson")}
      indicator={svg}
      rows={[
        { label: t("delimiter"), value: `"${delimiterName(delimiter)}"${draft.delimiter === "auto" ? ` (${t("auto")})` : ""}` },
        { label: t("quotedLabel"), value: f(a.quotedFields) },
        { label: t("headerRow"), value: toJson ? (draft.hasHeader ? t("yes") : t("no")) : t("built") },
        { label: t("formula"), value: `${f(a.rows.length)} × ${f(a.headers.length)} = ${f(fields)}` },
        { label: t("output"), value: t(toJson ? "outputJson" : "outputCsv", { n: f(a.rows.length) }), emphasize: true },
      ]}
    />
  );
}
