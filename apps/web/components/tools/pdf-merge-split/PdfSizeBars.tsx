"use client";
import { useTranslations } from "next-intl";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { formatBytes, SOURCE_FILL, usePdfModel } from "./PdfLiveContext";

const W = 340;
const H = 220;
const TOP = 26;
const BASE = H - 44;

/**
 * Type #1 (Labeled Bar Chart): file sizes measured from the real bytes — each input and the merged
 * output (merge), or the original and each part (split).
 */
export default function PdfSizeBars() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.sizes");
  const { draft, ready, sources, inputBytes, outputBytes, pct } = usePdfModel();
  if (!ready) return <PdfIndicatorUnavailable title={t("title")} />;

  const bars =
    draft.mode === "merge"
      ? [
          ...draft.mergeDocs.map((d, i) => ({ label: d.name.replace(/\.pdf$/i, ""), v: d.bytes, cls: SOURCE_FILL[i % SOURCE_FILL.length] })),
          { label: t("merged"), v: outputBytes, cls: "fill-zinc-700 dark:fill-zinc-200" },
        ]
      : [
          { label: t("original"), v: inputBytes, cls: "fill-zinc-700 dark:fill-zinc-200" },
          ...sources.map((s, i) => ({ label: s, v: draft.outputSizes[i] ?? 0, cls: SOURCE_FILL[i % SOURCE_FILL.length] })),
        ];
  const shown = bars.slice(0, 8);
  const peak = Math.max(...shown.map((b) => b.v), 1);
  const slot = W / shown.length;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {shown.map((b, i) => {
        const h = Math.max(3, (b.v / peak) * (BASE - TOP));
        const x = i * slot + slot * 0.18;
        const w = slot * 0.64;
        return (
          <g key={i}>
            <rect x={x} y={BASE - h} width={w} height={h} rx={4} className={b.cls} />
            <text x={x + w / 2} y={BASE - h - 6} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {formatBytes(b.v)}
            </text>
            <text x={x + w / 2} y={BASE + 16} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
              {b.label.length > 9 ? `${b.label.slice(0, 8)}…` : b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const diff = outputBytes - inputBytes;
  return (
    <PdfIndicatorCard
      title={t("title")}
      intro={t(draft.mode === "merge" ? "introMerge" : "introSplit")}
      indicator={svg}
      rows={[
        { label: t("inputs"), value: formatBytes(inputBytes) },
        { label: t("outputs"), value: formatBytes(outputBytes) },
        { label: t("difference"), value: `${diff >= 0 ? "+" : "−"}${formatBytes(Math.abs(diff))}` },
        { label: t("why"), value: draft.mode === "merge" ? t("whyMerge") : t("whySplit") },
        { label: t("change"), value: `${diff >= 0 ? "+" : "−"}${pct(Math.abs(diff), inputBytes)}`, emphasize: true },
      ]}
    />
  );
}
