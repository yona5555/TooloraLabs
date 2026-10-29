"use client";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { TYPE_FILL, useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 90;
const BAR_X = LABEL + 8;
const BAR_W = W - BAR_X - 10;
const ROW = 44;

/**
 * Type #20 (Annotated Reference Point): every numeric column as its own range from minimum to
 * maximum, with the mean pinned on it and the end values written out.
 */
export default function CsvNumericRanges() {
  const t = useTranslations("tools.csv-json-converter.education.lab.ranges");
  const { a, f } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;
  const cols = a.columns.filter((c) => c.numeric).slice(0, 6);
  if (cols.length === 0) {
    return (
      <CsvIndicatorCard
        title={t("title")}
        intro={t("intro")}
        indicator={<p className="w-[21rem] max-w-full text-center text-sm text-zinc-500 dark:text-zinc-400">{t("none")}</p>}
        rows={[{ label: t("numeric"), value: "0", emphasize: true }]}
      />
    );
  }

  const H = cols.length * ROW + 4;
  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {cols.map((c, i) => {
        const y = i * ROW + 6;
        const { min, max, mean } = c.numeric!;
        const pos = max > min ? (mean - min) / (max - min) : 0.5;
        return (
          <g key={c.name}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 16} textAnchor="end" fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
              {c.name.length > 11 ? `${c.name.slice(0, 10)}…` : c.name}
            </text>
            <rect x={BAR_X} y={y + 6} width={BAR_W} height={14} rx={7} className={TYPE_FILL[c.type]} opacity={0.35} />
            <circle cx={BAR_X + pos * BAR_W} cy={y + 13} r={8} strokeWidth={2.5} className={`${TYPE_FILL[c.type]} stroke-white dark:stroke-zinc-900`} />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X} y={y + 36} fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
              {f(min, 2)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + BAR_W} y={y + 36} textAnchor="end" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
              {f(max, 2)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + pos * BAR_W} y={y + 36} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(mean, 2)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const widest = [...cols].sort((x, y) => y.numeric!.max - y.numeric!.min - (x.numeric!.max - x.numeric!.min))[0];
  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("numeric"), value: f(cols.length) },
        ...cols.slice(0, 2).map((c) => ({ label: c.name, value: `${f(c.numeric!.min, 2)} … ${f(c.numeric!.max, 2)}` })),
        { label: t("widest"), value: `${widest.name} · ${f(widest.numeric!.max - widest.numeric!.min, 2)}` },
        { label: t("meanOf", { c: cols[0].name }), value: f(cols[0].numeric!.mean, 3), emphasize: true },
      ]}
    />
  );
}
