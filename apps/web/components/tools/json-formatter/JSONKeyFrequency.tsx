"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { useJSONModel } from "./JSONLiveContext";
import { clip } from "./jsonSvg";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 96;
const BAR_X = LABEL + 8;
const BAR_W = 196;
const ROW = 24;
const TOP = 8;
const MAX_ROWS = 8;

/**
 * Type #5 (Ranked Horizontal Bar List): the object keys that repeat most, a direct measure of how
 * much of the document is a list of records sharing one schema.
 */
export default function JSONKeyFrequency() {
  const t = useTranslations("tools.json-formatter.education.lab.keys");
  const { a, f, pct } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;
  if (a.keyFrequency.length === 0) {
    return (
      <JSONIndicatorCard
        title={t("title")}
        intro={t("intro")}
        indicator={<p className="w-[21rem] max-w-full text-center text-sm text-zinc-500 dark:text-zinc-400">{t("none")}</p>}
        rows={[{ label: t("unique"), value: "0", emphasize: true }]}
      />
    );
  }

  const rows = a.keyFrequency.slice(0, MAX_ROWS);
  const peak = rows[0].count;
  const H = TOP + rows.length * ROW;
  const repeated = a.keyFrequency.filter((k) => k.count > 1).length;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = TOP + i * ROW;
        const w = Math.max(3, (r.count / peak) * BAR_W);
        return (
          <g key={r.key}>
            <text style={{ fontSize: svgPx(12) }}
              x={LABEL}
              y={y + 14}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              className={i === 0 ? "fill-blue-700 font-bold dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}
            >
              {clip(r.key, 12)}
            </text>
            <rect x={BAR_X} y={y + 3} width={w} height={ROW - 8} rx={3} className={r.count > 1 ? "fill-blue-500 dark:fill-blue-400" : "fill-zinc-300 dark:fill-zinc-600"} />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + 14} fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
              ×{f(r.count)}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("unique"), value: f(a.keyFrequency.length) },
        { label: t("occurrences"), value: f(a.totalKeys) },
        { label: t("repeated"), value: f(repeated) },
        { label: t("top"), value: `"${clip(rows[0].key, 14)}" ×${f(peak)}` },
        {
          label: t("reuse"),
          value: pct(a.totalKeys - a.keyFrequency.length, a.totalKeys),
          emphasize: true,
        },
      ]}
    />
  );
}
