"use client";
import { useTranslations } from "next-intl";
import { PAPER_SIZES, PT_TO_MM } from "@tooloralabs/tools";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { usePdfModel } from "./PdfLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 110;
const BAR_X = LABEL + 8;
const BAR_W = 180;
const ROW = 32;

/**
 * Type #5 (Ranked Horizontal Bar List): the paper sizes found in the output, read from each page's
 * real dimensions and matched to ISO 216 (A3/A4/A5) or US (Letter/Legal/Tabloid) within 3 points.
 */
export default function PdfPaperRanking() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.paperRank");
  const tp = useTranslations("tools.pdf-merge-split.education.lab.paper");
  const { ready, pages, f, pct } = usePdfModel();
  if (!ready || pages.length === 0) return <PdfIndicatorUnavailable title={t("title")} />;

  const groups = new Map<string, { count: number; w: number; h: number; name: string; landscape: boolean }>();
  for (const p of pages) {
    const key = `${p.paper}-${p.landscape}`;
    const g = groups.get(key) ?? { count: 0, w: p.width, h: p.height, name: p.paper, landscape: p.landscape };
    g.count++;
    groups.set(key, g);
  }
  const rows = [...groups.values()].sort((a, b) => b.count - a.count);
  const peak = rows[0].count;
  const H = rows.length * ROW + 6;

  const svg = (
    <svg direction="ltr" width={W} height={Math.max(H, 80)} viewBox={`0 0 ${W} ${Math.max(H, 80)}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = i * ROW + 3;
        const w = Math.max(4, (r.count / peak) * BAR_W);
        return (
          <g key={i}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 13} textAnchor="end" fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
              {r.name === "other" ? tp("other") : r.name}
              {r.landscape ? " ⟷" : ""}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 26} textAnchor="end" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {f(r.w * PT_TO_MM, 0)}×{f(r.h * PT_TO_MM, 0)} mm
            </text>
            <rect x={BAR_X} y={y + 4} width={w} height={ROW - 12} rx={3} className={i === 0 ? "fill-blue-600 dark:fill-blue-400" : "fill-blue-300 dark:fill-blue-800"} />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + 18} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {f(r.count)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const top = rows[0];
  return (
    <PdfIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("kinds"), value: f(rows.length) },
        { label: t("most"), value: `${top.name === "other" ? tp("other") : top.name} · ${pct(top.count, pages.length)}` },
        { label: "A4", value: `${PAPER_SIZES.A4[0]} × ${PAPER_SIZES.A4[1]} pt = 210 × 297 mm` },
        { label: "Letter", value: `${PAPER_SIZES.Letter[0]} × ${PAPER_SIZES.Letter[1]} pt = 216 × 279 mm` },
        { label: t("mixed"), value: rows.length > 1 ? t("yes") : t("no"), emphasize: true },
      ]}
    />
  );
}
