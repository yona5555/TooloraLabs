"use client";
import { useTranslations } from "next-intl";
import { chunkRanges } from "@tooloralabs/tools";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { SOURCE_FILL, usePdfLive, usePdfModel } from "./PdfLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const ROW = 34;

/**
 * Type #3 (Hierarchical Flow): split — each token of the range text, the page range it parses to and
 * the part it becomes (with one-click chunk presets that rewrite the ranges); merge — each file and the
 * output page span it lands on.
 */
export default function PdfPlanFlow() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.flow");
  const { setDim } = usePdfLive();
  const { draft, ready, tokens, plan, f } = usePdfModel();
  if (!ready) return <PdfIndicatorUnavailable title={t("title")} />;

  const isSplit = draft.mode === "split" && plan && draft.splitDoc;
  const items = isSplit
    ? (tokens.length ? tokens : [{ text: t("empty"), range: null }]).map((tk) => ({ left: tk.text, mid: tk.range ? `${tk.range.start}–${tk.range.end}` : "✕", ok: !!tk.range }))
    : draft.mergeDocs.map((d, i) => {
        const start = draft.mergeDocs.slice(0, i).reduce((s, x) => s + x.pageCount, 0) + 1;
        return { left: d.name, mid: `${d.pageCount} → ${start}–${start + d.pageCount - 1}`, ok: true };
      });
  const shown = items.slice(0, 7);
  const H = Math.max(1, shown.length) * ROW + 6;

  const svg = (
    <div className="w-[340px] max-w-full">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {shown.map((it, i) => {
          const y = i * ROW + 4;
          return (
            <g key={i}>
              <rect x={0} y={y} width={120} height={26} rx={13} className="fill-zinc-200 dark:fill-zinc-700" />
              <text style={{ fontSize: svgPx(12) }} x={60} y={y + 17} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-100">
                {it.left.length > 15 ? `${it.left.slice(0, 14)}…` : it.left}
              </text>
              <path d={`M 124 ${y + 13} H 176 m -6 -5 l 6 5 l -6 5`} fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
              <rect x={182} y={y} width={W - 182} height={26} rx={13} className={it.ok ? SOURCE_FILL[i % SOURCE_FILL.length] : "fill-rose-500 dark:fill-rose-400"} />
              <text style={{ fontSize: svgPx(12) }} x={182 + (W - 182) / 2} y={y + 17} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-white">
                {it.mid}
              </text>
            </g>
          );
        })}
      </svg>
      {isSplit && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setDim("rangesInput", chunkRanges(draft.splitDoc!.pageCount, n))}
              className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:border-blue-400 dark:border-zinc-600 dark:text-zinc-300"
            >
              {t("chunk", { n })}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const rows = isSplit
    ? [
        { label: t("input"), value: draft.rangesInput || t("empty") },
        { label: t("tokens"), value: f(tokens.length) },
        { label: t("skipped"), value: f(tokens.filter((x) => !x.range).length) },
        { label: t("dropped"), value: f(plan!.dropped) },
        { label: t("parts"), value: f(plan!.parts.length), emphasize: true },
      ]
    : [
        { label: t("files"), value: f(draft.mergeDocs.length) },
        { label: t("order"), value: draft.mergeDocs.map((d) => d.name.replace(/\.pdf$/i, "")).join(" → ") },
        { label: t("first"), value: draft.mergeDocs[0]?.name ?? "—" },
        { label: t("last"), value: draft.mergeDocs[draft.mergeDocs.length - 1]?.name ?? "—" },
        { label: t("totalPages"), value: f(draft.mergeDocs.reduce((s, d) => s + d.pageCount, 0)), emphasize: true },
      ];

  return <PdfIndicatorCard title={t("title")} intro={t(isSplit ? "introSplit" : "introMerge")} indicator={svg} rows={rows} />;
}
