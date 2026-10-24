"use client";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import PdfMergeSplitShareExportModal from "./PdfMergeSplitShareExportModal";
import { formatBytes, SOURCE_FILL, usePdfModel } from "./PdfLiveContext";

const THUMB_H = 64;
/** Largest drawn page: the grid grows to the card width but a page never exceeds this. */
const THUMB_MAX_H = 136;
const THUMB_MAX_W = 104;
/** The 640×480 card frame the tool preview is letterboxed into. */
const TARGET_RATIO = 4 / 3;

/**
 * Columns for the page grid so the whole drawing comes out close to 4:3 (the card frame) instead of
 * one wide, low strip: for each column count, the grid's width ÷ height from the pages' mean aspect,
 * plus a penalty for empty cells left in the last row.
 */
function gridFor(pages: { width: number; height: number }[]) {
  const n = Math.max(1, pages.length);
  const aspect = pages.length ? pages.reduce((s, p) => s + p.width / p.height, 0) / pages.length : 1 / Math.SQRT2;
  let best = { cols: 1, score: Infinity };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    // Empty cells at the end of the last row count against a layout (no gaps in a grid).
    const score = Math.abs(Math.log((cols * aspect) / rows / TARGET_RATIO)) + (cols * rows - n) / n;
    if (score < best.score) best = { cols, score };
  }
  return { cols: best.cols };
}

/**
 * Result card: every page of the output drawn at its real aspect ratio and coloured by the input
 * file (merge) or the part (split) it ends up in, the files produced with their sizes, and the download.
 */
export default function PdfMergeSplitResult({ isProcessing, resultCount, onDownload }: { isProcessing: boolean; resultCount: number; onDownload: () => void }) {
  const t = useTranslations("tools.pdf-merge-split");
  const tr = useTranslations("tools.pdf-merge-split.result");
  const { draft, ready, pages, sources, inputBytes, outputBytes, f } = usePdfModel();
  const mode = draft.mode;
  const inputFileCount = mode === "merge" ? draft.mergeDocs.length : draft.splitDoc ? 1 : 0;
  const grid = gridFor(pages);
  const heroValue = mode === "merge" ? t("aboveFold.mergeReady") : t("aboveFold.splitReady", { count: resultCount });

  return (
    <SectionCard phoneRole="output"
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        ready ? (
          <PdfMergeSplitShareExportModal
            inputRows={[{ label: t("shareExport.inputFileCountLabel"), value: String(inputFileCount) }]}
            heroLabel={t("aboveFold.resultTitle")}
            heroValue={heroValue}
            sentence={t("shareExport.sentence", { mode, count: resultCount, inputCount: inputFileCount })}
          />
        ) : undefined
      }
    >
      {!ready ? (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {isProcessing || inputFileCount > 0 ? <Loader2 size={24} className="animate-spin" /> : null}
          {isProcessing || inputFileCount > 0 ? t("aboveFold.processing") : mode === "merge" ? t("aboveFold.placeholderMerge") : t("aboveFold.placeholderSplit")}
        </div>
      ) : (
        <>
          <p className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">{heroValue}</p>
          <p dir="ltr" className="mt-1 text-center font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">
            {f(pages.length)} {tr("pagesUnit")} · {formatBytes(outputBytes)}
          </p>

          <div
            dir="ltr"
            data-preview="visual"
            data-preview-hero
            className="mx-auto mt-4 grid w-full items-end justify-items-center gap-1.5 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50"
            style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`, maxWidth: grid.cols * THUMB_MAX_W + 24 }}
          >
            {pages.map((p, i) => {
              const w = Math.max(24, Math.round((p.width / p.height) * THUMB_H));
              return (
                <svg key={i} viewBox={`0 0 ${w} ${THUMB_H}`} className="h-auto w-full" style={{ maxWidth: (w / THUMB_H) * THUMB_MAX_H }} role="img" aria-label={`${sources[p.source]} p.${p.page}`}>
                  <path d={`M 1 1 H ${w - 9} L ${w - 1} 9 V ${THUMB_H - 1} H 1 Z`} className={`${SOURCE_FILL[p.source % SOURCE_FILL.length]} opacity-90`} />
                  <path d={`M ${w - 9} 1 V 9 H ${w - 1}`} className="fill-white/40" />
                  <text x={w / 2} y={THUMB_H / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-white">
                    {p.page}
                  </text>
                </svg>
              );
            })}
          </div>

          <ul className="mt-4 flex flex-col gap-1.5 text-sm lg:flex-1 lg:justify-center">
            {(mode === "merge"
              ? draft.mergeDocs.map((d, i) => ({ label: d.name, pages: d.pageCount, bytes: d.bytes, i }))
              : sources.map((s, i) => ({ label: s, pages: pages.filter((p) => p.source === i).length, bytes: draft.outputSizes[i] ?? 0, i }))
            ).map((row) => (
              <li key={row.i} className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                <svg width={10} height={10} aria-hidden="true">
                  <circle cx={5} cy={5} r={5} className={SOURCE_FILL[row.i % SOURCE_FILL.length]} />
                </svg>
                <span dir="ltr" className="min-w-0 flex-1 truncate font-mono text-zinc-700 dark:text-zinc-200">
                  {row.label}
                </span>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{tr("pages", { n: row.pages })}</span>
                <span dir="ltr" className="w-20 shrink-0 text-end font-mono text-xs text-zinc-600 dark:text-zinc-300">
                  {formatBytes(row.bytes)}
                </span>
              </li>
            ))}
          </ul>
          <p dir="ltr" className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {formatBytes(inputBytes)} → {formatBytes(outputBytes)}
          </p>

          <button
            type="button"
            onClick={onDownload}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Download size={16} />
            {mode === "merge" ? t("aboveFold.downloadMerged") : resultCount > 1 ? t("aboveFold.downloadZip") : tr("downloadPdf")}
          </button>
        </>
      )}
    </SectionCard>
  );
}
