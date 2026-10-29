"use client";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { delimiterName, useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const TOP = 26;
const BASE = H - 40;
const CANDIDATES = [",", ";", "\t", "|"];

/**
 * Type #1 (Labeled Bar Chart): how often each candidate delimiter appears per line of the CSV text,
 * averaged over the first lines, with its spread. The real delimiter is frequent and the same on every line.
 */
export default function CsvDelimiterBars() {
  const t = useTranslations("tools.csv-json-converter.education.lab.delimiter");
  const { a, delimiter, f } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const stats = CANDIDATES.map((d) => {
    const c = a.delimiterCounts[d] ?? [];
    const mean = c.length ? c.reduce((s, v) => s + v, 0) / c.length : 0;
    const consistent = c.length > 0 && c.every((v) => v === c[0]);
    return { d, mean, min: Math.min(...c, 0), max: Math.max(...c, 0), consistent };
  });
  const peak = Math.max(...stats.map((s) => s.max), 1);
  const slot = W / 4;
  const y = (v: number) => BASE - (v / peak) * (BASE - TOP);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {stats.map((s, i) => {
        const cx = i * slot + slot / 2;
        const on = s.d === delimiter;
        return (
          <g key={s.d}>
            <rect x={cx - 22} y={y(s.mean)} width={44} height={Math.max(2, BASE - y(s.mean))} rx={4} className={on ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-300 dark:fill-zinc-600"} />
            {s.max > s.min && <line x1={cx} y1={y(s.max)} x2={cx} y2={y(s.min)} strokeWidth={2} className="stroke-rose-500" />}
            <text style={{ fontSize: svgPx(12) }} x={cx} y={y(Math.max(s.mean, s.max)) - 6} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(s.mean, 1)}
            </text>
            <text style={{ fontSize: svgPx(14) }}
              x={cx}
              y={BASE + 18}
              textAnchor="middle"
              fontWeight={700}
              fontFamily="var(--font-mono)"
              className={on ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}
            >
              {delimiterName(s.d)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 33} textAnchor="middle" className={s.consistent && s.mean > 0 ? "fill-emerald-600 dark:fill-emerald-400" : "fill-zinc-400 dark:fill-zinc-500"}>
              {s.consistent && s.mean > 0 ? t("steady") : s.mean > 0 ? t("varies") : t("absent")}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const used = stats.find((s) => s.d === delimiter)!;
  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("mode"), value: t("modeValue") },
        { label: t("lines"), value: f((a.delimiterCounts[delimiter] ?? []).length) },
        { label: t("perLine"), value: used.min === used.max ? f(used.min) : `${f(used.min)}–${f(used.max)}` },
        { label: t("fields"), value: f(used.max + 1) },
        { label: t("used"), value: `"${delimiterName(delimiter)}"`, emphasize: true },
      ]}
    />
  );
}
