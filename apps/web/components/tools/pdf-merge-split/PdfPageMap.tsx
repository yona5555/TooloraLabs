"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PT_TO_MM } from "@tooloralabs/tools";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { SOURCE_FILL, usePdfModel } from "./PdfLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;

/**
 * Interactive piece: every output page at its real proportions, coloured by where it comes from.
 * Drag the slider through the output and the selected page is traced back to its source file and
 * original page number, with its paper size.
 */
export default function PdfPageMap() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.map");
  const tp = useTranslations("tools.pdf-merge-split.education.lab.paper");
  const { draft, ready, pages, sources, f } = usePdfModel();
  const [pick, setPick] = useState(0);
  if (!ready || pages.length === 0) return <PdfIndicatorUnavailable title={t("title")} />;

  const n = pages.length;
  const cols = Math.min(n, 8);
  const rows = Math.ceil(n / cols);
  const cellW = W / cols;
  const cellH = Math.min(96, (H - 30) / rows);
  const k = Math.min(pick, n - 1);
  const sel = pages[k];

  const svg = (
    <div className="w-[340px] max-w-full">
      <svg direction="ltr" width={W} height={rows * cellH + 8} viewBox={`0 0 ${W} ${rows * cellH + 8}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {pages.map((p, i) => {
          const maxW = cellW - 10;
          const maxH = cellH - 10;
          const s = Math.min(maxW / p.width, maxH / p.height);
          const w = p.width * s;
          const h = p.height * s;
          const x = (i % cols) * cellW + (cellW - w) / 2;
          const y = Math.floor(i / cols) * cellH + (cellH - h) / 2 + 4;
          const on = i === k;
          return (
            <g key={i} onClick={() => setPick(i)} className="cursor-pointer">
              <rect x={x} y={y} width={w} height={h} rx={2} className={`${SOURCE_FILL[p.source % SOURCE_FILL.length]} ${on ? "" : "opacity-60"}`} strokeWidth={on ? 3 : 0} stroke="currentColor" />
              <text style={{ fontSize: svgPx(13) }} x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontWeight={700} className="fill-white">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <input type="range" min={0} max={n - 1} value={k} onChange={(e) => setPick(Number(e.target.value))} aria-label={t("slider")} className="mt-2 w-full accent-blue-600" />
    </div>
  );

  return (
    <PdfIndicatorCard
      title={t("title")}
      intro={t(draft.mode === "merge" ? "introMerge" : "introSplit")}
      indicator={svg}
      rows={[
        { label: t("outputPage"), value: `${k + 1} / ${n}` },
        { label: draft.mode === "merge" ? t("fromFile") : t("inPart"), value: sources[sel.source] },
        { label: t("originalPage"), value: String(sel.page) },
        { label: t("paper"), value: `${sel.paper === "other" ? tp("other") : sel.paper}${sel.landscape ? ` · ${tp("landscape")}` : ""}` },
        { label: t("size"), value: `${f(sel.width * PT_TO_MM, 0)} × ${f(sel.height * PT_TO_MM, 0)} mm`, emphasize: true },
      ]}
    />
  );
}
