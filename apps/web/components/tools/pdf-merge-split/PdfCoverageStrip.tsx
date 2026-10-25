"use client";
import { useTranslations } from "next-intl";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { SOURCE_FILL, usePdfModel } from "./PdfLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 110;
const Y = 26;
const CELL_H = 40;

/**
 * Type #19 (Zone Strip): one cell per page of the source. Split: each page coloured by the part that
 * takes it — grey if no part does, amber if two or more do. Merge: each output page coloured by its file.
 */
export default function PdfCoverageStrip() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.coverage");
  const { draft, ready, pages, plan, f } = usePdfModel();
  if (!ready) return <PdfIndicatorUnavailable title={t("title")} />;

  const isSplit = draft.mode === "split" && plan && draft.splitDoc;
  const n = isSplit ? draft.splitDoc!.pageCount : pages.length;
  const cw = W / Math.max(1, n);
  const firstPart = (p: number) => (plan ? plan.parts.findIndex((part) => p >= part.start && p <= part.end) : -1);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text style={{ fontSize: svgPx(12) }} x={0} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {isSplit ? t("axisSplit", { n }) : t("axisMerge", { n })}
      </text>
      {Array.from({ length: n }, (_, i) => {
        const p = i + 1;
        let cls: string;
        if (isSplit) {
          const c = plan!.coverage[i];
          cls = c === 0 ? "fill-zinc-300 dark:fill-zinc-700" : c > 1 ? "fill-amber-500 dark:fill-amber-400" : SOURCE_FILL[firstPart(p) % SOURCE_FILL.length];
        } else cls = SOURCE_FILL[pages[i].source % SOURCE_FILL.length];
        return (
          <g key={i}>
            <rect x={i * cw + 1} y={Y} width={cw - 2} height={CELL_H} rx={4} className={cls} />
            {cw >= 16 && (
              <text style={{ fontSize: svgPx(12) }} x={i * cw + cw / 2} y={Y + CELL_H / 2 + 5} textAnchor="middle" fontWeight={700} className="fill-white">
                {isSplit ? p : pages[i].page}
              </text>
            )}
          </g>
        );
      })}
      <text style={{ fontSize: svgPx(12) }} x={0} y={H - 10} className="fill-zinc-500 dark:fill-zinc-400">
        {isSplit ? t("legendSplit") : t("legendMerge")}
      </text>
    </svg>
  );

  const rows = isSplit
    ? [
        { label: t("pages"), value: f(n) },
        { label: t("parts"), value: f(plan!.parts.length) },
        { label: t("unused"), value: f(plan!.unused) },
        { label: t("repeated"), value: f(plan!.repeated) },
        { label: t("covered"), value: `${f(n - plan!.unused)} / ${f(n)}`, emphasize: true },
      ]
    : [
        { label: t("pages"), value: f(n) },
        { label: t("files"), value: f(draft.mergeDocs.length) },
        { label: t("boundaries"), value: draft.mergeDocs.map((d, i) => draft.mergeDocs.slice(0, i).reduce((s, x) => s + x.pageCount, 0) + 1).join(", ") },
        { label: t("unused"), value: "0" },
        { label: t("covered"), value: `${f(n)} / ${f(n)}`, emphasize: true },
      ];

  return <PdfIndicatorCard title={t("title")} intro={t(isSplit ? "introSplit" : "introMerge")} indicator={svg} rows={rows} />;
}
