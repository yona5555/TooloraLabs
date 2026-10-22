"use client";
import { useTranslations } from "next-intl";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { useJSONModel } from "./JSONLiveContext";

const W = 340;
const H = 200;
const TOP = 22;
const BASE = H - 24;

/**
 * Type #1 (Labeled Bar Chart): how many values sit on each nesting level, root first — the shape
 * of the document from its skeleton down to its deepest leaves.
 */
export default function JSONDepthBars() {
  const t = useTranslations("tools.json-formatter.education.lab.depth");
  const { a, f, pct } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;

  const counts = a.depthCounts;
  const peak = Math.max(...counts);
  const slot = W / counts.length;
  const barW = Math.min(44, slot * 0.7);
  const widest = counts.indexOf(peak);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {counts.map((c, i) => {
        const h = Math.max(3, (c / peak) * (BASE - TOP - 14));
        const x = i * slot + (slot - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={BASE - h} width={barW} height={h} rx={4} className={i === widest ? "fill-blue-600 dark:fill-blue-400" : "fill-blue-300 dark:fill-blue-800"} />
            {(slot >= 18 || i === widest) && (
              <text x={x + barW / 2} y={BASE - h - 5} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
                {f(c)}
              </text>
            )}
            {(slot >= 18 || i % 2 === 0) && (
              <text x={x + barW / 2} y={BASE + 16} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
                {i + 1}
              </text>
            )}
          </g>
        );
      })}
      <text x={0} y={12} fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
    </svg>
  );

  const leaves = counts[counts.length - 1];
  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("levels"), value: f(a.maxDepth) },
        {
          label: t("widest"),
          value: `${t("level", { n: widest + 1 })} · ${f(peak)}`,
        },
        { label: t("share"), value: pct(peak, a.nodes) },
        { label: t("deepest"), value: f(leaves) },
        {
          label: t("fanout"),
          value: counts.length > 1 ? f(counts[1] / counts[0], 2) : "0",
        },
        { label: t("total"), value: f(a.nodes), emphasize: true },
      ]}
    />
  );
}
